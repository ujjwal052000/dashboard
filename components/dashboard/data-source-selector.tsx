"use client"

import { Card } from "@/components/ui/card"

interface DataSourceSelectorProps {
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
}

const dataSources = [
  { id: "test-sheet-1", name: "TEST SHEET 1", sheets: ["DRIP", "1-1 email outreacxh"] },
  { id: "test-sheet-2", name: "TEST SHEET 2", sheets: ["Linkeidn Outreach", "Calling"] },
]

export function DataSourceSelector({ selectedSources, onSourcesChange }: DataSourceSelectorProps) {
  const handleToggle = (id: string) => {
    if (selectedSources.includes(id)) {
      onSourcesChange(selectedSources.filter((s) => s !== id))
    } else {
      onSourcesChange([...selectedSources, id])
    }
  }

  return (
    <Card className="mb-8 border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-base font-semibold text-foreground">
        Data Sources
      </h2>
      <div className="space-y-3">
        {dataSources.map((source) => (
          <div
            key={source.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
          >
            <input
              type="checkbox"
              id={source.id}
              checked={selectedSources.includes(source.id)}
              onChange={() => handleToggle(source.id)}
              className="mt-1 cursor-pointer w-5 h-5"
            />
            <div className="flex-1">
              <label htmlFor={source.id} className="cursor-pointer font-medium text-foreground">
                {source.name}
              </label>
              <div className="mt-2 flex gap-2 flex-wrap">
                {source.sheets.map((sheet) => (
                  <span
                    key={sheet}
                    className="inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border"
                  >
                    {sheet}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
