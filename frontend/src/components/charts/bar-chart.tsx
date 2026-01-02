"use client"

import dynamic from "next/dynamic"
import { formatCurrency } from "@/lib/currency"

// Lazy load recharts components
const RechartsBarChart = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
)
const RechartsBar = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
)
const RechartsXAxis = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
)
const RechartsYAxis = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
)
const RechartsCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
)
const RechartsTooltip = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
)
const RechartsLegend = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
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
        {/* @ts-ignore - Recharts Tooltip formatter type compatibility */}
        <RechartsTooltip 
          formatter={(value: any) => formatCurrency(typeof value === 'number' ? value : 0, currency)}
        />
        <RechartsLegend />
        <RechartsBar dataKey="revenue" fill="#0088FE" name="Revenue" />
      </RechartsBarChart>
    </RechartsResponsiveContainer>
  )
}















