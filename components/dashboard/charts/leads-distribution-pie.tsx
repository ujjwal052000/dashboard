"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

interface LeadsDistributionPieProps {
  data: Array<Record<string, any>>
}

export function LeadsDistributionPie({ data }: LeadsDistributionPieProps) {
  // Calculate total leads by channel
  const leadsByChannel = {
    email: 0,
    linkedin: 0,
    calling: 0,
  }

  data.forEach(row => {
    const leads = Number(row['Leads'] || 0)
    if (leads === 0) return

    const sheetName = row._sheetName || ''
    const edm = String(row['EDM'] || '').toLowerCase()

    if (sheetName.includes('Calling') || edm.includes('calling')) {
      leadsByChannel.calling += leads
    } else if (sheetName.includes('LinkedIn') || edm.includes('linkedin')) {
      leadsByChannel.linkedin += leads
    } else if (sheetName.includes('email') || edm.includes('email') || edm.includes('edm')) {
      leadsByChannel.email += leads
    }
  })

  const chartData = [
    { name: 'Email', value: leadsByChannel.email },
    { name: 'LinkedIn', value: leadsByChannel.linkedin },
    { name: 'Calling', value: leadsByChannel.calling },
  ].filter(item => item.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No Leads Found
      </div>
    )
  }

  // Professional muted colors
  const COLORS = ['#94a3b8', '#64748b', '#475569']

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            if (percent < 0.05) return ''
            return `${name}: ${(percent * 100).toFixed(1)}%`
          }}
          outerRadius={100}
          fill="#888888"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [value.toLocaleString(), 'Leads']}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}
        />
        <Legend 
          formatter={(value) => {
            const item = chartData.find(d => d.name === value)
            const percent = item ? ((item.value / totalValue) * 100).toFixed(1) : '0'
            return `${value} (${percent}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

