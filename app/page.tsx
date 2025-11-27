"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { DataSourceSelector } from "@/components/dashboard/data-source-selector"
import { FilterPanel } from "@/components/dashboard/filter-panel"
import { ChartsGrid } from "@/components/dashboard/charts-grid"
import { DataTable } from "@/components/dashboard/data-table"
import { fetchMultipleSheets, type SheetRow, type MultiSheetResponse } from "@/lib/google-sheets-integration"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [selectedSources, setSelectedSources] = useState<string[]>(["test-sheet-1"])
  const [filters, setFilters] = useState({
    dateRange: "all",
    category: "all",
    region: "all",
  })
  const [sheetData, setSheetData] = useState<MultiSheetResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch data from Google Sheets
  const fetchData = async () => {
    if (selectedSources.length === 0) {
      setSheetData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetchMultipleSheets(selectedSources)
      setSheetData(response)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || "Failed to fetch data from Google Sheets")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and when sources change
  useEffect(() => {
    fetchData()
  }, [selectedSources])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, selectedSources])

  // Flatten all sheet data into a single array
  const allData = useMemo(() => {
    if (!sheetData) return []
    return sheetData.data.flatMap(sheet => sheet.data)
  }, [sheetData])

  // Get unique values for filters from actual data
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    allData.forEach((row: SheetRow) => {
      // Try to find category-like columns
      Object.keys(row).forEach(key => {
        if (key.toLowerCase().includes('category') || key.toLowerCase().includes('type') || key.toLowerCase().includes('edm')) {
          if (row[key]) categorySet.add(String(row[key]))
        }
      })
    })
    return Array.from(categorySet)
  }, [allData])

  const regions = useMemo(() => {
    const regionSet = new Set<string>()
    allData.forEach((row: SheetRow) => {
      Object.keys(row).forEach(key => {
        if (key.toLowerCase().includes('region') || key.toLowerCase().includes('location')) {
          if (row[key]) regionSet.add(String(row[key]))
        }
      })
    })
    return Array.from(regionSet)
  }, [allData])

  // Apply filters (simplified for now since we don't know exact column structure)
  const filteredData = useMemo(() => {
    return allData.filter((item: SheetRow) => {
      if (filters.category !== "all") {
        const hasCategory = Object.values(item).some(val => String(val) === filters.category)
        if (!hasCategory) return false
      }
      if (filters.region !== "all") {
        const hasRegion = Object.values(item).some(val => String(val) === filters.region)
        if (!hasRegion) return false
      }
      return true
    })
  }, [filters, allData])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Data Source Selector */}
        <DataSourceSelector selectedSources={selectedSources} onSourcesChange={setSelectedSources} />

        {/* Status and Controls */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {error && (
              <Alert variant="destructive" className="flex-1">
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
          <div className="flex items-center gap-2">
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
              No data available. Please select at least one data source or check your Google Sheets API configuration.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Filters */}
            {(categories.length > 0 || regions.length > 0) && (
              <FilterPanel filters={filters} onFiltersChange={setFilters} categories={categories} regions={regions} />
            )}

            {/* Charts - Only show if we have numeric data */}
            {sheetData && <ChartsGrid sheetData={sheetData} />}

            {/* Data Table */}
            {sheetData && <DataTable sheetData={sheetData} />}
          </>
        )}
      </main>
    </div>
  )
}
