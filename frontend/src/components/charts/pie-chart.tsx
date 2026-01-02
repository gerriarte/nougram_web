"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Lazy load recharts components
const RechartsPieChart = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.PieChart),
  { ssr: false }
)
const RechartsPie = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.Pie),
  { ssr: false }
)
const RechartsCell = dynamic(
  () => import("recharts").then((mod) => mod.Cell),
  { ssr: false }
)
const RechartsTooltip = dynamic(
  // @ts-ignore - Recharts types have compatibility issues with dynamic imports
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
)
const RechartsResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

interface PieChartData {
  name: string
  value: number
}

interface PieChartProps {
  data: PieChartData[]
  colors?: string[]
  height?: number
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function PieChart({ data, colors = DEFAULT_COLORS, height = 300 }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <RechartsResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <RechartsPie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: { name: string; percent: number }) => 
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <RechartsCell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </RechartsPie>
        <RechartsTooltip />
      </RechartsPieChart>
    </RechartsResponsiveContainer>
  )
}















