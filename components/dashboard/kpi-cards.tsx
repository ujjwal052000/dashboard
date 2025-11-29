"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Mail, Phone, Users, MousePointerClick, MessageSquare } from "lucide-react"
import { getColumnValue } from "@/lib/utils"
import type { SheetRow } from "@/lib/google-sheets-integration"

interface KPICardsProps {
  data: SheetRow[]
}

export function KPICards({ data }: KPICardsProps) {
  const metrics = useMemo(() => {
    let totalSent = 0
    let totalOpen = 0
    let totalClick = 0
    let totalConnected = 0
    let totalCalls = 0
    let totalLeads = 0

    data.forEach(row => {
      // Use flexible column matching
      totalSent += getColumnValue(row, ['Sent', 'sent', 'SENT', 'Sent ', ' Sent'])
      totalOpen += getColumnValue(row, ['Open', 'open', 'OPEN', 'Open ', ' Open'])
      totalClick += getColumnValue(row, ['Click', 'click', 'CLICK', 'Click ', ' Click'])
      totalConnected += getColumnValue(row, ['Connected', 'connected', 'CONNECTED', 'Connect', 'connect'])
      
      // For calls, check multiple variations
      const calls = getColumnValue(row, [
        'Calls', 'calls', 'CALLS', 'Calls ', ' Calls',
        'Call Made', 'call made', 'CALL MADE', 'Call Made ', ' Call Made',
        'Call', 'call', 'CALL'
      ])
      totalCalls += calls || getColumnValue(row, ['Sent', 'sent', 'SENT']) // Fallback to Sent if Calls not found
      
      totalLeads += getColumnValue(row, ['Leads', 'leads', 'LEADS', 'Leads ', ' Leads', 'Lead', 'lead'])
    })

    const openRate = totalSent > 0 ? ((totalOpen / totalSent) * 100).toFixed(1) : '0'
    const clickRate = totalSent > 0 ? ((totalClick / totalSent) * 100).toFixed(1) : '0'
    const connectionRate = totalCalls > 0 ? ((totalConnected / totalCalls) * 100).toFixed(1) : '0'

    return {
      totalSent,
      totalOpen,
      totalClick,
      totalConnected,
      totalCalls,
      totalLeads,
      openRate,
      clickRate,
      connectionRate,
    }
  }, [data])

  const kpiCards = [
    {
      title: "Total Sent",
      value: metrics.totalSent.toLocaleString(),
      icon: Mail,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Open Rate",
      value: `${metrics.openRate}%`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Click Rate",
      value: `${metrics.clickRate}%`,
      icon: MousePointerClick,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Total Leads",
      value: metrics.totalLeads.toLocaleString(),
      icon: Users,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Total Calls",
      value: metrics.totalCalls.toLocaleString(),
      icon: Phone,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      textColor: "text-teal-600 dark:text-teal-400",
    },
    {
      title: "Connection Rate",
      value: `${metrics.connectionRate}%`,
      icon: MessageSquare,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon
        // Extract color name from gradient string (e.g., "from-blue-500 to-blue-600" -> "blue")
        const colorName = kpi.color.split(' ')[0]?.replace('from-', '').split('-')[0] || 'blue'
        
        // Map color names to border colors
        const borderColorMap: Record<string, string> = {
          blue: 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-500',
          green: 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-500',
          purple: 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-500',
          orange: 'border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-500',
          teal: 'border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-500',
          indigo: 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-500',
        }
        const borderColor = borderColorMap[colorName] || 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
        
        return (
          <Card
            key={index}
            className={`border ${borderColor} bg-white dark:bg-gray-900 p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative group`}
            style={{
              borderWidth: '1px',
              transition: 'border-width 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderWidth = '3px'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderWidth = '1px'
            }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, hsl(var(--${colorName}-500)), hsl(var(--${colorName}-600)))`
              }}
            />
            <div className="relative z-10">
              <div className={`inline-flex p-3 rounded-xl ${kpi.bgColor} mb-4`}>
                <Icon className={`h-5 w-5 ${kpi.textColor}`} />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

