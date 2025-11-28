"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useMemo } from "react"
import { getColumnValue } from "@/lib/utils"

interface WeeklyActivityLineProps {
  data: Array<Record<string, any>>
}

export function WeeklyActivityLine({ data }: WeeklyActivityLineProps) {
  // Helper function to get week number within a month
  function getWeekOfMonth(date: Date): number {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const firstDayOfWeek = firstDay.getDay() || 7 // Sunday = 7
    const dayOfMonth = date.getDate()
    return Math.ceil((dayOfMonth + firstDayOfWeek - 1) / 7)
  }

  // Process data to get weekly activity volumes
  const weeklyData = useMemo(() => {
    const weeklyMap = new Map<string, { calls: number; linkedin: number; email: number; year: number; month: number; day: number }>()

    data.forEach(row => {
      // Parse date from From Date or To Date
      const dateStr = row['From Date'] || row['To Date'] || row['Date'] || ''
      if (!dateStr) return

      // Try to parse the date
      let date: Date
      try {
        date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          // Try parsing formats like "21 July", "1 Aug", etc.
          const parts = dateStr.split(' ')
          if (parts.length >= 2) {
            const monthMap: Record<string, number> = {
              'january': 0, 'jan': 0, 'february': 1, 'feb': 1, 'march': 2, 'mar': 2,
              'april': 3, 'apr': 3, 'may': 4, 'june': 5, 'jun': 5,
              'july': 6, 'jul': 6, 'august': 7, 'aug': 7,
              'september': 8, 'sep': 8, 'sept': 8, 'october': 9, 'oct': 9,
              'november': 10, 'nov': 10, 'december': 11, 'dec': 11
            }
            const month = monthMap[parts[1].toLowerCase()]
            const day = parseInt(parts[0])
            if (month !== undefined && !isNaN(day)) {
              date = new Date(new Date().getFullYear(), month, day)
            } else {
              return
            }
          } else {
            return
          }
        }
      } catch {
        return
      }

      // Get week of month and create key
      const year = date.getFullYear()
      const month = date.getMonth()
      const weekOfMonth = getWeekOfMonth(date)
      const weekKey = `${year}-${String(month).padStart(2, '0')}-${String(weekOfMonth).padStart(2, '0')}`

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { calls: 0, linkedin: 0, email: 0, year, month, day: date.getDate() })
      }

      const weekData = weeklyMap.get(weekKey)!

      // Determine activity type
      const sheetName = row._sheetName || ''
      const edm = String(row['EDM'] || '').toLowerCase()
      const sent = getColumnValue(row, ['Sent', 'sent', 'SENT'])

      if (sheetName.includes('Calling') || edm.includes('calling')) {
        const calls = getColumnValue(row, ['Calls', 'calls', 'CALLS', 'Call Made', 'Call', 'Sent', 'sent'])
        weekData.calls += calls || sent
      } else if (sheetName.includes('LinkedIn') || edm.includes('linkedin') || sheetName.includes('Linkeidn')) {
        weekData.linkedin += sent
      } else if (sheetName.includes('email') || sheetName.includes('DRIP') || edm.includes('email') || edm.includes('edm')) {
        weekData.email += sent
      }
    })

    // Month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Convert to array and sort by date
    const sortedData = Array.from(weeklyMap.entries())
      .map(([weekKey, data]) => {
        const [year, month, weekOfMonth] = weekKey.split('-').map(Number)
        return {
          weekKey,
          weekOfMonth,
          year,
          month,
          'Calling (Calls)': data.calls,
          'LinkedIn (Sent)': data.linkedin,
          '1-1 Email (Sent)': data.email,
        }
      })
      .sort((a, b) => {
        // Sort by year, then month, then week of month
        if (a.year !== b.year) return a.year - b.year
        if (a.month !== b.month) return a.month - b.month
        return a.weekOfMonth - b.weekOfMonth
      })

    // Show dates instead of week numbers
    return sortedData.map((item) => {
      // Calculate the date range for this week of month
      const firstDayOfMonth = new Date(item.year, item.month, 1)
      const firstDayOfWeek = firstDayOfMonth.getDay() || 7 // Sunday = 7
      const firstDayOfFirstWeek = 1 - (firstDayOfWeek - 1)
      const dayOfWeek = firstDayOfFirstWeek + (item.weekOfMonth - 1) * 7
      const weekStartDay = Math.max(1, dayOfWeek)
      const daysInMonth = new Date(item.year, item.month + 1, 0).getDate()
      const weekEndDay = Math.min(daysInMonth, dayOfWeek + 6)
      
      const weekStartDate = new Date(item.year, item.month, weekStartDay)
      const weekEndDate = new Date(item.year, item.month, weekEndDay)
      
      const formatDate = (date: Date) => {
        const day = date.getDate()
        const month = monthNames[date.getMonth()]
        return `${day} ${month}`
      }
      
      return {
        ...item,
        displayWeek: `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`,
      }
    })
  }, [data])

  // Use the formatted data directly
  const formattedData = weeklyData

  // Professional color scheme
  const colors = {
    'Calling (Calls)': '#3b82f6',      // Blue
    'LinkedIn (Sent)': '#f59e0b',       // Orange
    '1-1 Email (Sent)': '#10b981',       // Green
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="displayWeek" 
          stroke="#64748b"
          tick={{ fill: '#475569', fontSize: 12 }}
        />
        <YAxis 
          stroke="#64748b"
          tick={{ fill: '#475569', fontSize: 12 }}
          label={{ value: 'Volume (Calls/Sent)', angle: -90, position: 'insideLeft', style: { fill: '#475569' } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}
          labelStyle={{ color: '#475569', fontWeight: 600 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="Calling (Calls)" 
          stroke={colors['Calling (Calls)']} 
          strokeWidth={2}
          dot={{ r: 4, fill: colors['Calling (Calls)'] }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="LinkedIn (Sent)" 
          stroke={colors['LinkedIn (Sent)']} 
          strokeWidth={2}
          dot={{ r: 4, fill: colors['LinkedIn (Sent)'] }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="1-1 Email (Sent)" 
          stroke={colors['1-1 Email (Sent)']} 
          strokeWidth={2}
          dot={{ r: 4, fill: colors['1-1 Email (Sent)'] }}
          strokeDasharray="5 5"
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

