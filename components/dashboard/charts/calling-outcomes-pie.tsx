"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"

interface CallingFunnelBarProps {
  data: Array<Record<string, any>>
}

export function CallingFunnelBar({ data }: CallingFunnelBarProps) {
  // Extract calling data from the Calling sheet
  const callingData = data.filter(row => 
    row._sheetName === 'Calling' || 
    (row['EDM'] && row['EDM'].toString().toLowerCase().includes('calling'))
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
    callMade: 0,
    voicemail: 0,
    connect: 0,
    leads: 0,
  }

  callingData.forEach(row => {
    // Get call made - try multiple column name variations
    funnel.callMade += getColumnValue(row, [
      'Sent', 'sent', 'SENT', 'Sent ', ' Sent',
      'Calls', 'calls', 'CALLS', 'Calls ', ' Calls',
      'Call Made', 'call made', 'CALL MADE', 'Call Made ', ' Call Made',
      'Call', 'call', 'CALL'
    ])
    
    // Get voicemail
    funnel.voicemail += getColumnValue(row, [
      'Voicemail', 'voicemail', 'VOICEMAIL', 'Voicemail ', ' Voicemail',
      'Voice Mail', 'voice mail', 'VOICE MAIL'
    ])
    
    // Get connect
    funnel.connect += getColumnValue(row, [
      'Connected', 'connected', 'CONNECTED', 'Connected ', ' Connected',
      'Connect', 'connect', 'CONNECT', 'Connect ', ' Connect'
    ])
    
    // Get leads
    funnel.leads += getColumnValue(row, [
      'Leads', 'leads', 'LEADS', 'Leads ', ' Leads',
      'Lead', 'lead', 'LEAD'
    ])
  })

  // Debug logging in development (only log once per data change)
  // Removed to prevent continuous terminal output

  const chartData = [
    { name: 'Call Made', value: funnel.callMade },
    { name: 'Voicemail', value: funnel.voicemail },
    { name: 'Connect', value: funnel.connect },
    { name: 'Leads', value: funnel.leads },
  ]

  // Professional color scheme - shades of gray-blue getting darker
  const getBarColor = (index: number) => {
    const colors = ['#cbd5e1', '#94a3b8', '#64748b', '#475569']
    return colors[Math.min(index, colors.length - 1)]
  }

  if (chartData.every(item => item.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No calling data available
      </div>
    )
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

