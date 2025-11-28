import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Rate limiting: track last request time per sheet
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60000 // 60 seconds cache

// Google Sheets configuration
const SHEET_CONFIGS = {
  'test-sheet-1': {
    spreadsheetId: '1DkTBIBQc7xe_hEGM6prdIhOKE8dLMS4HvhD8KBQKQBA',
    sheets: [
      { name: 'DRIP', gid: '0' },
      { name: '1-1 email outreacxh', gid: '1576146995' }
    ]
  },
  'test-sheet-2': {
    spreadsheetId: '1U9TQAvyO3gL9KXncq-CVq6wKZO-qhSzSntFlnMMu_2s',
    sheets: [
      { name: 'Linkeidn Outreach', gid: '0' },
      { name: 'Calling', gid: '621015740' }
    ]
  }
}

// Initialize Google Sheets client with service account
function getSheetsClient() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT
  
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not set')
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(serviceAccountJson)
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT JSON format')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  return google.sheets({ version: 'v4', auth })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sourceId = searchParams.get('sourceId')
    const sheetName = searchParams.get('sheetName')

    if (!sourceId || !sheetName) {
      return NextResponse.json(
        { error: 'Missing sourceId or sheetName parameter' },
        { status: 400 }
      )
    }

    const config = SHEET_CONFIGS[sourceId as keyof typeof SHEET_CONFIGS]
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid source ID' },
        { status: 400 }
      )
    }

    const sheet = config.sheets.find(s => s.name === sheetName)
    if (!sheet) {
      return NextResponse.json(
        { error: 'Sheet not found' },
        { status: 404 }
      )
    }

    // Get Google Sheets client - this will throw if credentials are missing
    let sheets
    try {
      sheets = getSheetsClient()
    } catch (authError: any) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { 
          error: authError.message || 'Failed to authenticate with Google Sheets API',
          hint: 'Please check your GOOGLE_SERVICE_ACCOUNT environment variable in .env.local'
        },
        { status: 500 }
      )
    }

    // Fetch data from Google Sheets
    const range = `${sheetName}!A:Z` // Get all columns
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: range,
    })

    const rows = response.data.values || []

    // Return raw data with headers
    if (rows.length === 0) {
      return NextResponse.json({ headers: [], data: [] })
    }

    const headers = rows[0] || []
    const data = rows.slice(1).map((row: any[], index: number) => {
      const rowData: Record<string, any> = { _id: `${sheetName}-${index}` }
      headers.forEach((header, colIndex) => {
        rowData[header] = row[colIndex] || ''
      })
      return rowData
    })

    return NextResponse.json({
      sourceId,
      sheetName,
      headers,
      data,
      lastUpdated: new Date().toISOString()
    })
  } catch (error: any) {
    // Only log actual errors
    if (error.message && !error.message.includes('Failed to fetch')) {
      console.error('Error fetching sheet data:', error.message)
    }
    
    // Provide more detailed error messages
    let errorMessage = error.message || 'Internal server error'
    
    if (error.message?.includes('GOOGLE_SERVICE_ACCOUNT')) {
      errorMessage = 'Service account credentials not configured. Please check your .env.local file.'
    } else if (error.message?.includes('Invalid')) {
      errorMessage = 'Invalid service account JSON format. Please check your .env.local file.'
    } else if (error.message?.includes('Permission denied') || error.message?.includes('403')) {
      errorMessage = 'Permission denied. Please ensure the Google Sheets are shared with the service account email: dashboard-sheet@dashboard-479519.iam.gserviceaccount.com'
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      errorMessage = 'Sheet not found. Please check the sheet names and IDs in the configuration.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

// Fetch all sheets from a source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceIds } = body

    if (!sourceIds || !Array.isArray(sourceIds)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected sourceIds array.' },
        { status: 400 }
      )
    }

    // Get Google Sheets client - this will throw if credentials are missing
    let sheets
    try {
      sheets = getSheetsClient()
    } catch (authError: any) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { 
          error: authError.message || 'Failed to authenticate with Google Sheets API',
          hint: 'Please check your GOOGLE_SERVICE_ACCOUNT environment variable in .env.local'
        },
        { status: 500 }
      )
    }

    const allData: any[] = []
    const quotaErrorLogged = new Set<string>() // Track logged quota errors to avoid spam

    for (const sourceId of sourceIds) {
      const config = SHEET_CONFIGS[sourceId as keyof typeof SHEET_CONFIGS]
      if (!config) continue

      for (const sheet of config.sheets) {
        try {
          // Check cache first
          const cacheKey = `${sourceId}-${sheet.name}`
          const cached = requestCache.get(cacheKey)
          const now = Date.now()
          
          if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            // Use cached data
            allData.push(cached.data)
            continue
          }

          // Add delay between requests to avoid hitting rate limits
          if (allData.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 300)) // 300ms delay between requests
          }

          const range = `${sheet.name}!A:Z`
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.spreadsheetId,
            range: range,
          })

          const rows = response.data.values || []

          if (rows.length === 0) continue

          const headers = rows[0] || []
          const data = rows.slice(1).map((row: any[], index: number) => {
            const rowData: Record<string, any> = {
              _id: `${sourceId}-${sheet.name}-${index}`,
              _sourceId: sourceId,
              _sheetName: sheet.name
            }
            headers.forEach((header, colIndex) => {
              rowData[header] = row[colIndex] || ''
            })
            return rowData
          })

          const sheetData = {
            sourceId,
            sheetName: sheet.name,
            headers,
            data
          }
          
          // Cache the data
          requestCache.set(cacheKey, { data: sheetData, timestamp: now })
          
          allData.push(sheetData)
        } catch (error: any) {
          // Handle quota errors silently (only log once per sheet)
          if (error.message?.includes('Quota exceeded')) {
            const errorKey = `${sourceId}/${sheet.name}`
            if (!quotaErrorLogged.has(errorKey)) {
              quotaErrorLogged.add(errorKey)
              console.warn(`Quota exceeded for ${errorKey}. Requests will be cached.`)
            }
            // Continue to next sheet instead of breaking
            continue
          }
          
          // Only log other errors that are not expected
          if (error.code === 403) {
            console.error(`Permission denied for sheet ${sheet.name}. Make sure it's shared with: dashboard-sheet@dashboard-479519.iam.gserviceaccount.com`)
          } else if (error.code === 404) {
            console.error(`Sheet ${sheet.name} not found in spreadsheet ${config.spreadsheetId}`)
          } else if (error.code && error.code !== 'ENOTFOUND' && !error.message?.includes('Quota exceeded')) {
            console.error(`Error fetching ${sourceId}/${sheet.name}:`, error.message || error)
          }
        }
      }
    }

    return NextResponse.json({
      data: allData,
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error: any) {
    // Only log actual errors, not expected issues
    if (error.message && !error.message.includes('Failed to fetch')) {
      console.error('Error fetching multiple sheets:', error.message)
    }
    
    // Provide more detailed error messages
    let errorMessage = error.message || 'Internal server error'
    
    if (error.message?.includes('GOOGLE_SERVICE_ACCOUNT')) {
      errorMessage = 'Service account credentials not configured. Please check your .env.local file.'
    } else if (error.message?.includes('Invalid')) {
      errorMessage = 'Invalid service account JSON format. Please check your .env.local file.'
    } else if (error.message?.includes('Permission denied') || error.message?.includes('403')) {
      errorMessage = 'Permission denied. Please ensure the Google Sheets are shared with the service account email: dashboard-sheet@dashboard-479519.iam.gserviceaccount.com'
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      errorMessage = 'Sheet not found. Please check the sheet names and IDs in the configuration.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

