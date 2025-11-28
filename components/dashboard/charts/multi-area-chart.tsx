"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface MultiAreaChartProps {
  data: Array<Record<string, any>>
}

export function MultiAreaChartComponent({ data }: MultiAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradient-sent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradient-open" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradient-click" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="sent" 
          stroke="#3b82f6" 
          strokeWidth={2}
          fill="url(#gradient-sent)"
          name="Sent"
        />
        <Area 
          type="monotone" 
          dataKey="open" 
          stroke="#10b981" 
          strokeWidth={2}
          fill="url(#gradient-open)"
          name="Open"
        />
        <Area 
          type="monotone" 
          dataKey="click" 
          stroke="#f59e0b" 
          strokeWidth={2}
          fill="url(#gradient-click)"
          name="Click"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

