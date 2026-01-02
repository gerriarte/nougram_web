"use client"

import dynamic from "next/dynamic"

// Lazy load recharts components
// @ts-ignore - Recharts types have compatibility issues with dynamic imports
const RechartsAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false }
)
// @ts-ignore - Recharts types have compatibility issues with dynamic imports
const RechartsArea = dynamic(
  () => import("recharts").then((mod) => mod.Area),
  { ssr: false }
)
// @ts-ignore - Recharts types have compatibility issues with dynamic imports
const RechartsXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
)
// @ts-ignore - Recharts types have compatibility issues with dynamic imports
const RechartsYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
)
const RechartsCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
)
// @ts-ignore - Recharts types have compatibility issues with dynamic imports
const RechartsTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
)
// @ts-ignore - Recharts types have compatibility issues with dynamic imports
const RechartsLegend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
)
const RechartsResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

interface AreaChartData {
  month: string
  revenue?: number
  costs?: number
  profit?: number
  [key: string]: string | number | undefined
}

interface AreaChartProps {
  data: AreaChartData[]
  dataKeys: string[]
  colors?: string[]
  height?: number
  currency?: string
  formatter?: (value: number) => string
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28']

export function AreaChart({ 
  data, 
  dataKeys, 
  colors = DEFAULT_COLORS, 
  height = 300,
  currency,
  formatter
}: AreaChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    )
  }

  const defaultFormatter = (value: number) => {
    if (currency && formatter) {
      return formatter(value)
    }
    return value.toLocaleString()
  }

  return (
    <RechartsResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        <defs>
          {dataKeys.map((key, index) => (
            <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
            </linearGradient>
          ))}
        </defs>
        <RechartsCartesianGrid strokeDasharray="3 3" />
        <RechartsXAxis 
          dataKey="month"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <RechartsYAxis />
        <RechartsTooltip 
          formatter={formatter || defaultFormatter}
        />
        <RechartsLegend />
        {dataKeys.map((key, index) => (
          <RechartsArea
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fillOpacity={1}
            fill={`url(#color${key})`}
          />
        ))}
      </RechartsAreaChart>
    </RechartsResponsiveContainer>
  )
}















