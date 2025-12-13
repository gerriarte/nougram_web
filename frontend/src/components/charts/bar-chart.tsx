"use client"

import dynamic from "next/dynamic"
import { formatCurrency } from "@/lib/currency"

// Lazy load recharts components
const RechartsBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
)
const RechartsBar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
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

interface BarChartData {
  service: string
  revenue: number
}

interface BarChartProps {
  data: BarChartData[]
  height?: number
  currency?: string
}

export function BarChart({ data, height = 300, currency = "USD" }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <RechartsResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <RechartsCartesianGrid strokeDasharray="3 3" />
        <RechartsXAxis 
          dataKey="service" 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <RechartsYAxis />
        <RechartsTooltip 
          formatter={(value: number) => formatCurrency(value, currency)}
        />
        <RechartsLegend />
        <RechartsBar dataKey="revenue" fill="#0088FE" name="Revenue" />
      </RechartsBarChart>
    </RechartsResponsiveContainer>
  )
}


