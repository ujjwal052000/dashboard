"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { PieChartComponent } from "./charts/pie-chart"
import { BarChartComponent } from "./charts/bar-chart"
import { StackedBarChartComponent } from "./charts/stacked-bar-chart"
import { LineChartComponent } from "./charts/line-chart"
import type { MultiSheetResponse, SheetRow } from "@/lib/google-sheets-integration"

interface ChartsGridProps {
  sheetData: MultiSheetResponse
}

// Helper function to extract numeric columns and create chart-friendly data
function extractChartData(sheetData: MultiSheetResponse) {
  const allRows = sheetData.data.flatMap(sheet => sheet.data)
  
  // Find numeric columns (like Sent, Open, Click, etc.)
  const numericColumns: string[] = []
  const categoryColumns: string[] = []
  const dateColumns: string[] = []
  
  if (allRows.length > 0) {
    const firstRow = allRows[0]
    Object.keys(firstRow).forEach(key => {
      if (key.startsWith('_')) return // Skip internal fields
      
      const sampleValue = firstRow[key]
      const numValue = Number(sampleValue)
      
      if (!isNaN(numValue) && sampleValue !== '' && typeof sampleValue !== 'object') {
        numericColumns.push(key)
      } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('from') || key.toLowerCase().includes('to')) {
        dateColumns.push(key)
      } else if (!key.toLowerCase().includes('note') && !key.toLowerCase().includes('alias')) {
        categoryColumns.push(key)
      }
    })
  }
  
  // Transform data for charts - use first numeric column as value
  const chartData = allRows.map((row: SheetRow, index: number) => {
    const value = numericColumns.length > 0 ? Number(row[numericColumns[0]]) || 0 : 0
    const category = categoryColumns.find(col => row[col]) ? String(row[categoryColumns.find(col => row[col])!]) : 'Other'
    const name = row['Aliaes'] || row['Alias'] || row['Name'] || `Item ${index + 1}`
    const date = dateColumns.length > 0 ? String(row[dateColumns[0]] || '') : ''
    
    return {
      id: row._id || `row-${index}`,
      name,
      value,
      category,
      region: category, // Using category as region for now
      date
    }
  }).filter(item => item.value > 0) // Only include rows with numeric values
  
  return { chartData, numericColumns, categoryColumns }
}

export function ChartsGrid({ sheetData }: ChartsGridProps) {
  const { chartData, numericColumns } = useMemo(() => extractChartData(sheetData), [sheetData])
  
  // Don't show charts if no numeric data
  if (chartData.length === 0 || numericColumns.length === 0) {
    return (
      <div className="mb-12">
        <Card className="border-0 bg-gradient-to-br from-card to-secondary/10 p-6 shadow-lg">
          <p className="text-muted-foreground text-center py-8">
            No numeric data available for charts. Charts will appear when numeric columns are detected.
          </p>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
        <span className="text-3xl">📈</span>
        Analytics
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-gradient-to-br from-card to-secondary/10 p-6 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-shadow">
          <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-lg">🥧</span>
            Distribution by Category
          </h3>
          <PieChartComponent data={chartData} />
        </Card>

        <Card className="border-0 bg-gradient-to-br from-card to-accent/10 p-6 shadow-lg shadow-accent/5 hover:shadow-accent/10 transition-shadow">
          <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-lg">📊</span>
            Values Overview
          </h3>
          <BarChartComponent data={chartData} />
        </Card>

        <Card className="border-0 bg-gradient-to-br from-card to-primary/10 p-6 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-shadow">
          <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-lg">📋</span>
            Category Performance
          </h3>
          <StackedBarChartComponent data={chartData} />
        </Card>

        <Card className="border-0 bg-gradient-to-br from-card to-chart-2/10 p-6 shadow-lg shadow-chart-2/5 hover:shadow-chart-2/10 transition-shadow">
          <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-lg">📉</span>
            Trend Over Time
          </h3>
          <LineChartComponent data={chartData} />
        </Card>
      </div>
    </div>
  )
}
