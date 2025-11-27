"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface LineChartProps {
  data: Array<{
    id: string
    name: string
    value: number
    category: string
    region: string
    date: string
  }>
}

export function LineChartComponent({ data }: LineChartProps) {
  // Group data by date and sum values
  const trendData = data.reduce(
    (acc, item) => {
      const existing = acc.find((d) => d.date === item.date)
      if (existing) {
        existing.value += item.value
      } else {
        acc.push({ date: item.date, value: item.value })
      }
      return acc
    },
    [] as Array<{ date: string; value: number }>,
  )

  // Sort by date
  trendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
