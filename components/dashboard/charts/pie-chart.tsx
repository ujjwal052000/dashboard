"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

interface PieChartProps {
  data: Array<{
    id: string
    name: string
    value: number
    category: string
    region: string
    date: string
  }>
}

export function PieChartComponent({ data }: PieChartProps) {
  // Group data by category and sum values
  const categoryData = data.reduce(
    (acc, item) => {
      const existing = acc.find((d) => d.name === item.category)
      if (existing) {
        existing.value += item.value
      } else {
        acc.push({ name: item.category, value: item.value })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
