"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import type { SheetRow } from "@/lib/google-sheets-integration"

const PREFERRED_COLUMN_GROUPS: string[][] = [
  ['From Date', 'Date', 'Created Date', 'date', 'DATE'],
  ['Aliaes', 'Alias', 'Aliases', 'ALIASES'],
  ['EDM', 'Campaign', 'Channel', 'Type', 'Activity'],
  ['Sent', 'sent', 'SENT'],
  ['Open', 'Opened', 'open', 'OPEN'],
  ['Click', 'Clicked', 'click', 'CLICK'],
  ['Unsubscribe', 'unsubscribe', 'UNSUBSCRIBE', 'Opt Out', 'Opt-out'],
  ['Leads', 'Lead', 'leads', 'LEAD'],
]

const NUMERIC_HEADER_REGEX = /(sent|open|click|unsubscribe|leads)/i

const getCellAlignment = (header: string, isNumeric: boolean) => {
  // Left align for text columns
  if (/date/i.test(header) || /alia/i.test(header) || /edm|campaign|channel|type|activity|name/i.test(header)) {
    return 'text-left'
  }
  // Right align for all numeric columns
  if (isNumeric || NUMERIC_HEADER_REGEX.test(header)) {
    return 'text-right font-mono tabular-nums'
  }
  return 'text-left'
}

const getHeaderAlignment = (header: string) => {
  // Left align for text columns
  if (/date/i.test(header) || /alia/i.test(header) || /edm|campaign|channel|type|activity|name/i.test(header)) {
    return 'text-left'
  }
  // Right align for numeric columns
  if (NUMERIC_HEADER_REGEX.test(header)) {
    return 'text-right'
  }
  return 'text-left'
}

interface DataTableProps {
  filteredData: SheetRow[]
}

export function DataTable({ filteredData }: DataTableProps) {
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedSheet, setSelectedSheet] = useState<string>("all")

  // Get all unique headers from filtered data
  const allHeaders = useMemo(() => {
    const headerSet = new Set<string>()
    filteredData.forEach(row => {
      Object.keys(row).forEach(header => {
        if (!header.startsWith('_')) {
          headerSet.add(header)
        }
      })
    })
    return Array.from(headerSet)
  }, [filteredData])

  // Get unique sheet names from filtered data
  const sheetNames = useMemo(() => {
    const sheetSet = new Set<string>()
    filteredData.forEach(row => {
      if (row._sheetName) {
        sheetSet.add(row._sheetName)
      }
    })
    return Array.from(sheetSet)
  }, [filteredData])

  // Get data to display
  const displayData = useMemo(() => {
    if (selectedSheet === "all") {
      return filteredData
    } else {
      return filteredData.filter(row => row._sheetName === selectedSheet)
    }
  }, [filteredData, selectedSheet])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return displayData
    
    return [...displayData].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      // Try to parse as number
      const aNum = Number(aVal)
      const bNum = Number(bVal)
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum
      }

      const aStr = String(aVal || '')
      const bStr = String(bVal || '')
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [displayData, sortBy, sortOrder])

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("desc")
    }
  }

  // Get headers for the selected sheet(s)
  const tableHeaders = useMemo(() => {
    const availableHeaders = allHeaders.filter(header => header.toLowerCase() !== 'value')
    const orderedHeaders: string[] = []

    const findMatch = (candidates: string[]) => {
      return availableHeaders.find(header =>
        candidates.some(candidate => header.trim().toLowerCase() === candidate.trim().toLowerCase())
      )
    }

    PREFERRED_COLUMN_GROUPS.forEach(group => {
      const match = findMatch(group)
      if (match && !orderedHeaders.includes(match)) {
        orderedHeaders.push(match)
      }
    })

    return orderedHeaders
  }, [allHeaders])

  return (
    <Card className="border-0 bg-white dark:bg-gray-900 p-5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Raw data snapshot</p>
          <h2 className="text-xl font-semibold text-foreground">Key funnel columns</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Sheet:</label>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Sheets</option>
            {sheetNames.map(sheetName => (
              <option key={sheetName} value={sheetName}>
                {sheetName}
              </option>
            ))}
          </select>
        </div>
      </div>
      {tableHeaders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No funnel-specific columns detected. Make sure your sheets include Date, Sent, and Leads information.
        </p>
      ) : (
        <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-2 sm:px-0">
            <div className="overflow-x-auto overflow-y-auto rounded-2xl border border-border/40 shadow-inner max-h-[360px]">
              <table className="w-full min-w-[600px] text-xs sm:text-sm">
                <thead>
                  <tr className="bg-muted/40 text-[11px] sm:text-xs">
                    {tableHeaders.map((header) => {
                      const headerAlignment = getHeaderAlignment(header)
                      return (
                    <th
                      key={header}
                      onClick={() => handleSort(header)}
                      className={`cursor-pointer px-3 py-3 font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap ${headerAlignment}`}
                      style={NUMERIC_HEADER_REGEX.test(header) ? { textAlign: 'right' } : undefined}
                    >
                      {header}
                      {sortBy === header && (
                        <span className="ml-2 text-muted-foreground">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan={tableHeaders.length} className="px-4 py-8 text-center text-muted-foreground">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((row, idx) => (
                      <tr
                        key={row._id || idx}
                        className="border-b border-border/20 bg-white/80 dark:bg-gray-900/40 even:bg-muted/30 hover:bg-primary/5 transition-colors text-[12px] sm:text-xs"
                      >
                        {tableHeaders.map((header, colIdx) => {
                          const value = row[header] || ''
                          const isNumeric = !isNaN(Number(value)) && value !== '' && value !== null
                          const alignment = getCellAlignment(header, isNumeric)
                          return (
                            <td
                              key={`${header}-${colIdx}`}
                              className={`px-3 py-2 text-foreground whitespace-nowrap ${alignment}`}
                              style={isNumeric ? { textAlign: 'right' } : undefined}
                            >
                              {isNumeric ? Number(value).toLocaleString() : String(value)}
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <p className="mt-4 text-[11px] text-muted-foreground">
        Showing {sortedData.length} record{sortedData.length !== 1 ? 's' : ''} from {selectedSheet === "all" ? "all sheets" : selectedSheet}
      </p>
    </Card>
  )
}
