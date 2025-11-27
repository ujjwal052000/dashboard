"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import type { MultiSheetResponse, SheetRow } from "@/lib/google-sheets-integration"

interface DataTableProps {
  sheetData: MultiSheetResponse
}

export function DataTable({ sheetData }: DataTableProps) {
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedSheet, setSelectedSheet] = useState<string>("all")

  // Get all unique headers across all sheets
  const allHeaders = useMemo(() => {
    const headerSet = new Set<string>()
    sheetData.data.forEach(sheet => {
      sheet.headers.forEach(header => {
        if (!header.startsWith('_')) {
          headerSet.add(header)
        }
      })
    })
    return Array.from(headerSet)
  }, [sheetData])

  // Get data to display
  const displayData = useMemo(() => {
    let data: SheetRow[] = []
    
    if (selectedSheet === "all") {
      data = sheetData.data.flatMap(sheet => sheet.data)
    } else {
      const sheet = sheetData.data.find(s => s.sheetName === selectedSheet)
      data = sheet?.data || []
    }
    
    return data
  }, [sheetData, selectedSheet])

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
    if (selectedSheet === "all") {
      return allHeaders
    } else {
      const sheet = sheetData.data.find(s => s.sheetName === selectedSheet)
      return sheet?.headers.filter(h => !h.startsWith('_')) || []
    }
  }, [selectedSheet, sheetData, allHeaders])

  return (
    <Card className="border-0 bg-gradient-to-br from-card to-secondary/5 p-6 shadow-lg shadow-primary/5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Raw Data
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Sheet:</label>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Sheets</option>
            {sheetData.data.map(sheet => (
              <option key={sheet.sheetName} value={sheet.sheetName}>
                {sheet.sourceId} - {sheet.sheetName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="cursor-pointer px-4 py-4 text-left text-sm font-semibold text-foreground hover:bg-primary/20 transition-colors whitespace-nowrap"
                >
                  {header}
                  {sortBy === header && (
                    <span className="ml-2 text-primary">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
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
                <tr key={row._id || idx} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                  {tableHeaders.map((header) => {
                    const value = row[header] || ''
                    const isNumeric = !isNaN(Number(value)) && value !== ''
                    return (
                      <td
                        key={header}
                        className={`px-4 py-3 text-sm ${isNumeric ? 'font-semibold text-foreground' : 'text-foreground'}`}
                      >
                        {isNumeric ? (
                          <span className="bg-gradient-to-r from-primary/20 to-accent/10 bg-clip-text text-foreground">
                            {Number(value).toLocaleString()}
                          </span>
                        ) : (
                          <span>{String(value)}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Showing {sortedData.length} record{sortedData.length !== 1 ? 's' : ''} from {selectedSheet === "all" ? "all sheets" : selectedSheet}
      </p>
    </Card>
  )
}
