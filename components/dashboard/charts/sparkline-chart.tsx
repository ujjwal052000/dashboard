"use client"

import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from "recharts"

interface SparklineChartProps {
  data: Array<{ name: string; value: number }>
  color: string
  height?: number
}

export function SparklineChart({ data, color, height = 60 }: SparklineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sparkline-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          fill={`url(#sparkline-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

