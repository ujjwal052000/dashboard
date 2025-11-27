/**
 * Google Sheets Integration Layer
 * Client-side functions to fetch data from Google Sheets via API routes
 */

export interface SheetRow {
  [key: string]: any
  _id?: string
  _sourceId?: string
  _sheetName?: string
}

export interface SheetResponse {
  sourceId: string
  sheetName: string
  headers: string[]
  data: SheetRow[]
  lastUpdated?: string
}

export interface MultiSheetResponse {
  data: SheetResponse[]
  lastUpdated: string
}

/**
 * Fetch data from multiple Google Sheets
 * @param sourceIds - Array of source IDs to fetch from
 */
export async function fetchMultipleSheets(sourceIds: string[]): Promise<MultiSheetResponse> {
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceIds }),
      cache: 'no-store' // Always fetch fresh data
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching multiple sheets:', error)
    throw error
  }
}

/**
 * Fetch data from a single sheet
 * @param sourceId - The source ID
 * @param sheetName - The sheet name
 */
export async function fetchSheetData(sourceId: string, sheetName: string): Promise<SheetResponse> {
  try {
    const response = await fetch(
      `/api/sheets?sourceId=${encodeURIComponent(sourceId)}&sheetName=${encodeURIComponent(sheetName)}`,
      {
        cache: 'no-store' // Always fetch fresh data
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    throw error
  }
}

/**
 * Flatten multi-sheet response into a single array of rows
 */
export function flattenSheetData(response: MultiSheetResponse): SheetRow[] {
  const allRows: SheetRow[] = []
  
  for (const sheetResponse of response.data) {
    allRows.push(...sheetResponse.data)
  }
  
  return allRows
}
