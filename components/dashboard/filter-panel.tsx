"use client"

import { Card } from "@/components/ui/card"

interface FilterPanelProps {
  filters: {
    dateRange: string
    aliases: string
    customStartDate?: string
    customEndDate?: string
  }
  onFiltersChange: (filters: any) => void
  aliases: string[]
}

export function FilterPanel({ filters, onFiltersChange, aliases }: FilterPanelProps) {
  const handleChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleDateChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      dateRange: 'custom', // Ensure dateRange is set to custom when dates change
    })
  }

  return (
    <Card className="mb-8 border-0 bg-white dark:bg-gray-900 p-6 shadow-lg">
      <h2 className="mb-6 text-lg font-bold text-foreground">
        Filters
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleChange("dateRange", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="all">All</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="custom">Custom</option>
          </select>
          
          {/* Custom Date Range Inputs */}
          {filters.dateRange === "custom" && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.customStartDate || ''}
                  onChange={(e) => handleDateChange("customStartDate", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.customEndDate || ''}
                  onChange={(e) => handleDateChange("customEndDate", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Aliases Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Aliases</label>
          <select
            value={filters.aliases}
            onChange={(e) => handleChange("aliases", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="all">All Aliases</option>
            {aliases.map((alias) => (
              <option key={alias} value={alias}>
                {alias}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  )
}
