"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { FilterPanel } from "@/components/dashboard/filter-panel"
import { ChartsGrid } from "@/components/dashboard/charts-grid"
import { DataTable } from "@/components/dashboard/data-table"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { fetchMultipleSheets, type SheetRow, type MultiSheetResponse } from "@/lib/google-sheets-integration"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  // Always load data from both sheets
  const selectedSources = ["test-sheet-1", "test-sheet-2"]
  const [filters, setFilters] = useState({
    dateRange: "all",
    aliases: "all",
    customStartDate: "",
    customEndDate: "",
  })
  const [sheetData, setSheetData] = useState<MultiSheetResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch data from Google Sheets
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchMultipleSheets(selectedSources)
      setSheetData(response)
      setLastUpdated(new Date())
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch data from Google Sheets"
      setError(errorMessage)
      // Only log errors, not on every render
      if (err.message && !err.message.includes('Failed to fetch')) {
        console.error("Error fetching data:", err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedSources])

  // Initial fetch on mount
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Auto-refresh every 60 seconds (reduced frequency to avoid quota issues)
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData()
    }, 60000) // 60 seconds - increased to reduce API calls

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]) // Only depend on autoRefresh, fetchData is stable

  // Flatten all sheet data into a single array
  const allData = useMemo(() => {
    if (!sheetData) return []
    return sheetData.data.flatMap(sheet => sheet.data)
  }, [sheetData])

  // Get unique aliases from actual data
  const aliases = useMemo(() => {
    const aliasSet = new Set<string>()
    allData.forEach((row: SheetRow) => {
      // Look for Aliaes column (note the typo in the sheet)
      const alias = row['Aliaes'] || row['Alias'] || row['Aliases'] || ''
      if (alias && String(alias).trim() !== '') {
        aliasSet.add(String(alias).trim())
      }
    })
    return Array.from(aliasSet).sort()
  }, [allData])

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = allData

    // Apply aliases filter
    if (filters.aliases !== "all") {
      filtered = filtered.filter((item: SheetRow) => {
        const alias = item['Aliaes'] || item['Alias'] || item['Aliases'] || ''
        return String(alias).trim() === filters.aliases
      })
    }

    // Apply date range filter
    if (filters.dateRange === "all") {
      // Show all data - no date filtering
      // filtered remains as is
    } else if (filters.dateRange === "custom") {
      // Custom date range
      if (filters.customStartDate || filters.customEndDate) {
        const startDate = filters.customStartDate ? new Date(filters.customStartDate) : new Date(0)
        const endDate = filters.customEndDate ? new Date(filters.customEndDate) : new Date()

        filtered = filtered.filter((item: SheetRow) => {
          const dateStr = item['From Date'] || item['To Date'] || item['Date'] || ''
          if (!dateStr) return true

          try {
            const itemDate = new Date(dateStr)
            if (isNaN(itemDate.getTime())) return true
            return itemDate >= startDate && itemDate <= endDate
          } catch {
            return true
          }
        })
      }
    } else {
      // Predefined ranges (7d, 30d)
      const now = new Date()
      let cutoffDate: Date

      if (filters.dateRange === "7d") {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (filters.dateRange === "30d") {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        cutoffDate = new Date(0) // Fallback - all time
      }

      filtered = filtered.filter((item: SheetRow) => {
        const dateStr = item['From Date'] || item['To Date'] || item['Date'] || ''
        if (!dateStr) return true

        try {
          const itemDate = new Date(dateStr)
          if (isNaN(itemDate.getTime())) return true
          return itemDate >= cutoffDate
        } catch {
          return true
        }
      })
    }

    return filtered
  }, [filters, allData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Status and Controls */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {error && (
              <Alert variant="destructive" className="flex-1 min-w-[220px]">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {lastUpdated && !error && (
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto-refresh: {autoRefresh ? "ON" : "OFF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading && allData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading data from Google Sheets...</span>
          </div>
        ) : allData.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No data available. Please check your Google Sheets API configuration and ensure the sheets are shared with the service account.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* KPI Cards */}
            {filteredData.length > 0 && <KPICards data={filteredData} />}

            {/* Filters */}
            <FilterPanel filters={filters} onFiltersChange={setFilters} aliases={aliases} />

            {/* Charts - Pass filtered data */}
            {sheetData && <ChartsGrid filteredData={filteredData} />}

            {/* Data Table */}
            {sheetData && <DataTable filteredData={filteredData} />}
          </>
        )}
      </main>
    </div>
  )
}
