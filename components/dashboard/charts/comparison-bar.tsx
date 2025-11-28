"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ComparisonBarProps {
  data: Array<{ name: string; email: number; linkedin: number; calling: number }>
}

export function ComparisonBarChart({ data }: ComparisonBarProps) {
  const colors = {
    email: '#3b82f6',
    linkedin: '#8b5cf6',
    calling: '#10b981'
  }

  // Extract values from data - handle both array and single object formats
  const emailValue = Array.isArray(data) 
    ? (data.find(d => d.name === 'Email')?.email || data[0]?.email || 0)
    : (data.email || 0)
  
  const linkedinValue = Array.isArray(data)
    ? (data.find(d => d.name === 'LinkedIn')?.linkedin || data[0]?.linkedin || 0)
    : (data.linkedin || 0)
  
  const callingValue = Array.isArray(data)
    ? (data.find(d => d.name === 'Calling')?.calling || data[0]?.calling || 0)
    : (data.calling || 0)

  // Transform data to show separate bars for each channel
  const transformedData = [
    {
      name: 'Calling',
      value: callingValue,
      color: colors.calling
    },
    {
      name: 'Email',
      value: emailValue,
      color: colors.email
    },
    {
      name: 'LinkedIn',
      value: linkedinValue,
      color: colors.linkedin
    }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={transformedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          formatter={(value: number) => [value.toLocaleString(), 'Count']}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

