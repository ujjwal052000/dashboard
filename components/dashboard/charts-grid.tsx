"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { CallingFunnelBar } from "./charts/calling-outcomes-pie"
import { EmailFunnelBar } from "./charts/email-funnel-bar"
import { LinkedInFunnelBar } from "./charts/linkedin-funnel-bar"
import { WeeklyActivityLine } from "./charts/weekly-activity-line"
import { DripFunnelBar } from "./charts/drip-funnel-bar"
import { MultiAreaChartComponent } from "./charts/multi-area-chart"
import { DonutChartComponent } from "./charts/donut-chart"
import { ComparisonBarChart } from "./charts/comparison-bar"
import { TrendingUp, Mail, Phone, Users } from "lucide-react"
import { getColumnValue } from "@/lib/utils"
import type { SheetRow } from "@/lib/google-sheets-integration"

interface ChartsGridProps {
  filteredData: SheetRow[]
}

export function ChartsGrid({ filteredData }: ChartsGridProps) {
  const allData = filteredData

  // Prepare data for comparison chart - single row with all channels
  const comparisonData = useMemo(() => {
    const emailData = allData.filter(row => 
      row._sheetName === '1-1 email outreacxh' || row._sheetName === 'DRIP' ||
      (row['EDM'] && row['EDM'].toString().toLowerCase().includes('email'))
    )
    const linkedinData = allData.filter(row => 
      row._sheetName === 'Linkeidn Outreach' || 
      (row['EDM'] && row['EDM'].toString().toLowerCase().includes('linkedin'))
    )
    const callingData = allData.filter(row => 
      row._sheetName === 'Calling' || 
      (row['EDM'] && row['EDM'].toString().toLowerCase().includes('calling'))
    )

    const emailTotal = emailData.reduce((sum, row) => sum + getColumnValue(row, ['Sent', 'sent', 'SENT']), 0)
    const linkedinTotal = linkedinData.reduce((sum, row) => sum + getColumnValue(row, ['Sent', 'sent', 'SENT']), 0)
    const callingTotal = callingData.reduce((sum, row) => {
      const calls = getColumnValue(row, ['Calls', 'calls', 'CALLS', 'Call Made', 'Call', 'Sent', 'sent'])
      return sum + calls
    }, 0)

    return [
      {
        name: 'Channels',
        email: emailTotal,
        linkedin: linkedinTotal,
        calling: callingTotal,
      },
    ]
  }, [allData])

  // Prepare data for donut chart (channel distribution)
  const channelDistribution = useMemo(() => {
    const email = allData
      .filter(row => row._sheetName === '1-1 email outreacxh' || row._sheetName === 'DRIP')
      .reduce((sum, row) => sum + getColumnValue(row, ['Sent', 'sent', 'SENT']), 0)
    
    const linkedin = allData
      .filter(row => row._sheetName === 'Linkeidn Outreach')
      .reduce((sum, row) => sum + getColumnValue(row, ['Sent', 'sent', 'SENT']), 0)
    
    const calling = allData
      .filter(row => row._sheetName === 'Calling')
      .reduce((sum, row) => {
        const calls = getColumnValue(row, ['Calls', 'calls', 'CALLS', 'Call Made', 'Call', 'Sent', 'sent'])
        return sum + calls
      }, 0)

    return [
      { name: 'Email', value: email },
      { name: 'LinkedIn', value: linkedin },
      { name: 'Calling', value: calling },
    ].filter(item => item.value > 0)
  }, [allData])

  // Prepare area chart data (engagement over time)
  const engagementData = useMemo(() => {
    const monthlyData = new Map<string, { sent: number; open: number; click: number }>()

    allData.forEach(row => {
      const dateStr = row['From Date'] || row['To Date'] || row['Date'] || ''
      if (!dateStr) return

      try {
        let date = new Date(dateStr)
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
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { sent: 0, open: 0, click: 0 })
        }
        
        const monthData = monthlyData.get(monthKey)!
        monthData.sent += getColumnValue(row, ['Sent', 'sent', 'SENT'])
        monthData.open += getColumnValue(row, ['Open', 'open', 'OPEN'])
        monthData.click += getColumnValue(row, ['Click', 'click', 'CLICK'])
      } catch {
        return
      }
    })

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        name: month,
        sent: data.sent,
        open: data.open,
        click: data.click,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-6) // Last 6 months
  }, [allData])
  
  return (
    <div className="mb-12 space-y-8">
      {/* Main Funnel Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Funnel */}
        <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">1-1 Email Outreach Funnel</h3>
          </div>
          <EmailFunnelBar data={allData} />
        </Card>

        {/* LinkedIn Funnel */}
        <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">LinkedIn Outreach Funnel</h3>
          </div>
          <LinkedInFunnelBar data={allData} />
        </Card>

        {/* DRIP Funnel */}
        <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">DRIP Outreach Funnel</h3>
          </div>
          <DripFunnelBar data={allData} />
        </Card>

        {/* Calling Funnel */}
        <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Calling Funnel</h3>
          </div>
          <CallingFunnelBar data={allData} />
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Channel Distribution Donut */}
        <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Channel Distribution</h3>
          </div>
          <DonutChartComponent 
            data={channelDistribution}
            colors={['#3b82f6', '#8b5cf6', '#10b981']}
            title="Channel Distribution"
          />
        </Card>

        {/* Channel Comparison */}
        <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Channel Comparison</h3>
          </div>
          <ComparisonBarChart data={comparisonData} />
        </Card>
      </div>

      {/* Engagement Over Time Chart */}
      <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Engagement Over Time</h3>
        </div>
        {engagementData.length > 0 ? (
          <MultiAreaChartComponent data={engagementData} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No engagement data available
          </div>
        )}
      </Card>

      {/* Weekly Activity */}
      <Card className="border-0 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
            <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Weekly Activity Volume Over Time</h3>
        </div>
        <WeeklyActivityLine data={allData} />
      </Card>
    </div>
  )
}

