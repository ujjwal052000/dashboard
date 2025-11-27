"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]

interface StackedBarChartProps {
  data: Array<{
    id: string
    name: string
    value: number
    category: string
    region: string
    date: string
  }>
}

export function StackedBarChartComponent({ data }: StackedBarChartProps) {
  // Group data by region and category
  const stackedData = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.name === item.region)
    if (existing) {
      existing[item.category] = (existing[item.category] || 0) + item.value
    } else {
      const newEntry: any = { name: item.region }
      newEntry[item.category] = item.value
      acc.push(newEntry)
    }
    return acc
  }, [] as any[])

  const categories = Array.from(new Set(data.map((item) => item.category)))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={stackedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {categories.map((category, index) => (
          <Bar key={category} dataKey={category} stackId="a" fill={COLORS[index % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
