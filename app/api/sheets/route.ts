import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

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

    // Get Google Sheets client
    const sheets = getSheetsClient()

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
    console.error('Error fetching sheet data:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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

    // Get Google Sheets client
    const sheets = getSheetsClient()

    const allData: any[] = []

    for (const sourceId of sourceIds) {
      const config = SHEET_CONFIGS[sourceId as keyof typeof SHEET_CONFIGS]
      if (!config) continue

      for (const sheet of config.sheets) {
        try {
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

          allData.push({
            sourceId,
            sheetName: sheet.name,
            headers,
            data
          })
        } catch (error) {
          console.error(`Error fetching ${sourceId}/${sheet.name}:`, error)
        }
      }
    }

    return NextResponse.json({
      data: allData,
      lastUpdated: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error fetching multiple sheets:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

