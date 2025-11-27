"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface BarChartProps {
  data: Array<{
    id: string
    name: string
    value: number
    category: string
    region: string
    date: string
  }>
}

export function BarChartComponent({ data }: BarChartProps) {
  // Group data by region and sum values
  const regionData = data.reduce(
    (acc, item) => {
      const existing = acc.find((d) => d.name === item.region)
      if (existing) {
        existing.value += item.value
      } else {
        acc.push({ name: item.region, value: item.value })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={regionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="hsl(var(--chart-1))" />
      </BarChart>
    </ResponsiveContainer>
  )
}
