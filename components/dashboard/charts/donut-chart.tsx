"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface DonutChartProps {
  data: Array<{ name: string; value: number }>
  colors: string[]
  title: string
}

export function DonutChartComponent({ data, colors, title }: DonutChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString(), 'Count']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => {
              const item = data.find(d => d.name === value)
              const total = data.reduce((sum, d) => sum + d.value, 0)
              const percent = item ? ((item.value / total) * 100).toFixed(1) : '0'
              return `${value} (${percent}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

