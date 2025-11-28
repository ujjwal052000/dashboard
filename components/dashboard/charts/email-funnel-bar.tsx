"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"

interface EmailFunnelBarProps {
  data: Array<Record<string, any>>
}

export function EmailFunnelBar({ data }: EmailFunnelBarProps) {
  // Extract 1-1 email outreach data
  const emailData = data.filter(row => 
    row._sheetName === '1-1 email outreacxh' ||
    (row['EDM'] && row['EDM'].toString().toLowerCase().includes('1-1'))
  )

  // Aggregate the funnel metrics
  const funnel = {
    sent: 0,
    open: 0,
    click: 0,
    unsubscribe: 0,
    leads: 0,
  }

  emailData.forEach(row => {
    funnel.sent += Number(row['Sent'] || 0)
    funnel.open += Number(row['Open'] || 0)
    funnel.click += Number(row['Click'] || 0)
    funnel.unsubscribe += Number(row['Unsubscribe'] || 0)
    funnel.leads += Number(row['Leads'] || 0)
  })

  const chartData = [
    { name: 'Sent', value: funnel.sent },
    { name: 'Open', value: funnel.open },
    { name: 'Click', value: funnel.click },
    { name: 'Unsubscribe', value: funnel.unsubscribe },
    { name: 'Leads', value: funnel.leads },
  ]

  // Professional color scheme - shades of blue getting darker
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

