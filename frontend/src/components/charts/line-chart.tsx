"use client"

import dynamic from "next/dynamic"

// Lazy load recharts components
const RechartsLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
)
const RechartsLine = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
)
const RechartsXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
)
const RechartsYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
)
const RechartsCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
)
const RechartsTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
)
const RechartsLegend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
)
const RechartsResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

interface LineChartData {
  month: string
  revenue?: number
  projects?: number
  [key: string]: string | number | undefined
}

interface LineChartProps {
  data: LineChartData[]
  dataKeys: string[]
  colors?: string[]
  height?: number
  currency?: string
  formatter?: (value: number) => string
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function LineChart({ 
  data, 
  dataKeys, 
  colors = DEFAULT_COLORS, 
  height = 300,
  currency,
  formatter
}: LineChartProps) {
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
      <RechartsLineChart data={data}>
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
          <RechartsLine
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </RechartsResponsiveContainer>
  )
}












