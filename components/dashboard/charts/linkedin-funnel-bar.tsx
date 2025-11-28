"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"

interface LinkedInFunnelBarProps {
  data: Array<Record<string, any>>
}

export function LinkedInFunnelBar({ data }: LinkedInFunnelBarProps) {
  // Extract LinkedIn outreach data
  const linkedinData = data.filter(row => 
    row._sheetName === 'Linkeidn Outreach' ||
    row._sheetName === 'LinkedIn Outreach' ||
    (row['EDM'] && row['EDM'].toString().toLowerCase().includes('linkedin'))
  )

  // Aggregate the funnel metrics
  const funnel = {
    sent: 0,
    connected: 0,
    messages: 0,
    leads: 0,
  }

  linkedinData.forEach(row => {
    funnel.sent += Number(row['Sent'] || 0)
    funnel.connected += Number(row['Connected'] || 0)
    funnel.messages += Number(row['Messages'] || 0)
    funnel.leads += Number(row['Leads'] || 0)
  })

  const chartData = [
    { name: 'Sent', value: funnel.sent },
    { name: 'Connected', value: funnel.connected },
    { name: 'Messages', value: funnel.messages },
    { name: 'Leads', value: funnel.leads },
  ]

  // Professional color scheme - shades of purple/teal
  const getBarColor = (index: number) => {
    const colors = ['#6366f1', '#818cf8', '#14b8a6', '#0d9488']
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

