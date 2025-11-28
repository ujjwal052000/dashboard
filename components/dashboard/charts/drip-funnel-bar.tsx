"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"

interface DripFunnelBarProps {
  data: Array<Record<string, any>>
}

export function DripFunnelBar({ data }: DripFunnelBarProps) {
  // Extract DRIP data from the DRIP sheet
  const dripData = data.filter(row => 
    row._sheetName === 'DRIP' ||
    (row['EDM'] && row['EDM'].toString().toLowerCase().includes('drip'))
  )

  // Helper function to find column value (case-insensitive, handles spaces, partial matches)
  const getColumnValue = (row: Record<string, any>, possibleNames: string[]): number => {
    // First try exact matches (case-insensitive)
    for (const name of possibleNames) {
      const foundKey = Object.keys(row).find(key => 
        key.toLowerCase().trim() === name.toLowerCase().trim()
      )
      if (foundKey) {
        const value = row[foundKey]
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value)
          if (!isNaN(numValue)) {
            return numValue
          }
        }
      }
    }
    
    // If no exact match, try partial matches (contains)
    for (const name of possibleNames) {
      const foundKey = Object.keys(row).find(key => 
        key.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(key.toLowerCase())
      )
      if (foundKey) {
        const value = row[foundKey]
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value)
          if (!isNaN(numValue)) {
            return numValue
          }
        }
      }
    }
    
    return 0
  }

  // Aggregate the funnel metrics
  const funnel = {
    sent: 0,
    open: 0,
    click: 0,
    unsubscribe: 0,
    leads: 0,
  }

  dripData.forEach(row => {
    funnel.sent += getColumnValue(row, ['Sent', 'sent', 'SENT', 'Sent ', ' Sent'])
    funnel.open += getColumnValue(row, ['Open', 'open', 'OPEN', 'Open ', ' Open'])
    funnel.click += getColumnValue(row, ['Click', 'click', 'CLICK', 'Click ', ' Click'])
    funnel.unsubscribe += getColumnValue(row, ['Unsubscribe', 'unsubscribe', 'UNSUBSCRIBE', 'Unsubscribe ', ' Unsubscribe'])
    funnel.leads += getColumnValue(row, ['Leads', 'leads', 'LEADS', 'Leads ', ' Leads', 'Lead', 'lead'])
  })

  // Debug logging in development (only log once per data change)
  // Removed to prevent continuous terminal output

  const chartData = [
    { name: 'Sent', value: funnel.sent },
    { name: 'Open', value: funnel.open },
    { name: 'Click', value: funnel.click },
    { name: 'Unsubscribe', value: funnel.unsubscribe },
    { name: 'Leads', value: funnel.leads },
  ]

  // Professional color scheme - shades of gray-blue getting darker
  const getBarColor = (index: number) => {
    const colors = ['#cbd5e1', '#94a3b8', '#64748b', '#64748b', '#475569']
    return colors[Math.min(index, colors.length - 1)]
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b"
          tick={{ fill: '#475569', fontSize: 12 }}
        />
        <YAxis 
          stroke="#64748b"
          tick={{ fill: '#475569', fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [value.toLocaleString(), 'Count']}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}
          labelStyle={{ color: '#475569', fontWeight: 600 }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
          ))}
          <LabelList 
            dataKey="value" 
            position="top" 
            formatter={(value: number) => value.toLocaleString()}
            style={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

