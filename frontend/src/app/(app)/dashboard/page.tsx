"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useGetDashboardData, useGetBlendedCostRate } from "@/lib/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, SUPPORTED_CURRENCIES } from "@/lib/currency"
import { Loader2, DollarSign, Target, Briefcase, Users, Filter, X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart } from "@/components/charts/pie-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { LineChart } from "@/components/charts/line-chart"
import { AreaChart } from "@/components/charts/area-chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Lazy load AI Advisor (heavy component)
const AIAdvisor = dynamic(
  () => import("@/components/insights/ai-advisor").then((mod) => mod.AIAdvisor),
  { 
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Asesor IA</CardTitle>
          <CardDescription>Cargando insights de IA...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }
)

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
const PROJECT_STATUSES = ["Draft", "Sent", "Won", "Lost"]

export default function DashboardPage() {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [currency, setCurrency] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [clientName, setClientName] = useState<string>("")
  const [comparePrevious, setComparePrevious] = useState<boolean>(false)
  
  const [activeFilters, setActiveFilters] = useState<{ 
    start?: string
    end?: string
    currency?: string
    status?: string
    clientName?: string
    comparePrevious?: boolean
  }>({})
  
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useGetDashboardData(
    activeFilters.start,
    activeFilters.end,
    activeFilters.currency,
    activeFilters.status,
    activeFilters.clientName,
    activeFilters.comparePrevious
  )
  const { data: costRateData, isLoading: costRateLoading, error: costRateError } = useGetBlendedCostRate()
  
  const handleApplyFilters = () => {
    setActiveFilters({
      start: startDate || undefined,
      end: endDate || undefined,
      currency: currency || undefined,
      status: status || undefined,
      clientName: clientName || undefined,
      comparePrevious: comparePrevious || undefined,
    })
  }
  
  const handleClearFilters = () => {
    setStartDate("")
    setEndDate("")
    setCurrency("")
    setStatus("")
    setClientName("")
    setComparePrevious(false)
    setActiveFilters({})
  }
  
  const hasActiveFilters = !!(activeFilters.start || activeFilters.end || activeFilters.currency || activeFilters.status || activeFilters.clientName || activeFilters.comparePrevious)

  if (dashboardLoading || costRateLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vista general de tu agencia</p>
        </div>
        <LoadingSkeleton type="card" count={5} />
        <LoadingSkeleton type="chart" />
      </div>
    )
  }

  if (dashboardError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vista general de tu agencia</p>
        </div>
        <ErrorDisplay
          error={dashboardError}
          onRetry={() => refetchDashboard()}
          title="Error al cargar dashboard"
          autoRetry={true}
          maxRetries={3}
        />
      </div>
    )
  }

  // Calculate comparison with previous period
  const previousPeriod = dashboardData?.previous_period
  const revenueChange = previousPeriod 
    ? ((dashboardData?.total_revenue || 0) - (previousPeriod.total_revenue || 0)) / (previousPeriod.total_revenue || 1) * 100
    : null
  const projectsChange = previousPeriod
    ? ((dashboardData?.total_projects || 0) - (previousPeriod.total_projects || 0)) / (previousPeriod.total_projects || 1) * 100
    : null

  const kpis = [
    {
      title: "Total de Proyectos",
      value: dashboardData?.total_projects || 0,
      icon: Briefcase,
      description: "Total proyectos creados",
      change: projectsChange,
      previousValue: previousPeriod?.total_projects
    },
    {
      title: "Ingresos Totales",
      value: formatCurrency(dashboardData?.total_revenue || 0, activeFilters.currency || "USD"),
      icon: DollarSign,
      description: "Ingresos totales estimados",
      change: revenueChange,
      previousValue: previousPeriod?.total_revenue
    },
    {
      title: "Margen Promedio",
      value: `${((dashboardData?.average_margin || 0) * 100).toFixed(1)}%`,
      icon: Target,
      description: "Margen promedio"
    },
    {
      title: "Tasa de Conversión",
      value: `${(dashboardData?.conversion_rate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      description: "Tasa de conversión (Sent → Won)"
    },
    {
      title: "Ingreso Promedio/Proyecto",
      value: formatCurrency(dashboardData?.average_revenue_per_project || 0, activeFilters.currency || "USD"),
      icon: DollarSign,
      description: "Ingreso promedio por proyecto"
    },
    {
      title: "Utilización del Equipo",
      value: `${(dashboardData?.utilization_rate || 0).toFixed(1)}%`,
      icon: Users,
      description: "Tasa de utilización del equipo"
    }
  ]

  // Prepare data for charts
  const statusData = Object.entries(dashboardData?.projects_by_status || {}).map(([status, count]) => ({
    name: status,
    value: count
  }))

  const revenueData = Object.entries(dashboardData?.revenue_by_service || {})
    .map(([service, revenue]) => ({
      service,
      revenue: revenue as number
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10) // Top 10 services

  // Monthly trends data
  const monthlyTrendsData = (dashboardData?.monthly_trends || []).map((trend: { month: string; revenue: number; projects: number }) => ({
    month: trend.month,
    revenue: trend.revenue,
    projects: trend.projects
  }))

  // Area chart data (revenue and costs over time)
  const areaChartData = (dashboardData?.monthly_trends || []).map((trend: { month: string; revenue: number; projects: number }) => ({
    month: trend.month,
    revenue: trend.revenue,
    // Note: costs would need to be calculated per month in backend
  }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel</h1>
          <p className="text-muted-foreground">Resumen del rendimiento de tu agencia</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra los datos del panel por fecha, moneda, estado o cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha de Inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha de Fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency || "all"} onValueChange={(value) => setCurrency(value === "all" ? "" : value)}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Todas las monedas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las monedas</SelectItem>
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? "" : value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {PROJECT_STATUSES.map((stat) => {
                    const statusLabels: Record<string, string> = {
                      "Draft": "Borrador",
                      "Sent": "Enviado",
                      "Won": "Ganado",
                      "Lost": "Perdido"
                    }
                    return (
                      <SelectItem key={stat} value={stat}>
                        {statusLabels[stat] || stat}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-name">Nombre del Cliente</Label>
              <Input
                id="client-name"
                type="text"
                placeholder="Filtrar por nombre del cliente..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compare-previous">Comparar Período Anterior</Label>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="compare-previous"
                  type="checkbox"
                  checked={comparePrevious}
                  onChange={(e) => setComparePrevious(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="compare-previous" className="text-sm font-normal">
                  Habilitar comparación
                </Label>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Mostrando datos filtrados
          {activeFilters.start && ` desde ${activeFilters.start}`}
          {activeFilters.end && ` hasta ${activeFilters.end}`}
          {activeFilters.currency && ` en ${activeFilters.currency}`}
          {activeFilters.status && ` con estado ${activeFilters.status}`}
          {activeFilters.clientName && ` para cliente "${activeFilters.clientName}"`}
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const hasChange = kpi.change !== null && kpi.change !== undefined
          const isPositive = hasChange && kpi.change! > 0
          
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                {hasChange && (
                  <div className={`flex items-center text-xs mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {Math.abs(kpi.change!).toFixed(1)}% vs período anterior
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Projects by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos por Estado</CardTitle>
            <CardDescription>Distribución de proyectos por estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart data={statusData} colors={CHART_COLORS} />
          </CardContent>
        </Card>

        {/* Revenue by Service Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Servicio</CardTitle>
            <CardDescription>Principales servicios por ingresos estimados</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={revenueData} currency={activeFilters.currency || "USD"} />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Line Chart */}
      {monthlyTrendsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencias Mensuales</CardTitle>
            <CardDescription>Ingresos y proyectos en los últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={monthlyTrendsData} 
              dataKeys={['revenue', 'projects']}
              colors={['#0088FE', '#00C49F']}
              formatter={(value) => formatCurrency(value, activeFilters.currency || "USD")}
            />
          </CardContent>
        </Card>
      )}

      {/* Revenue & Costs Area Chart */}
      {areaChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Revenue over time (last 12 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart 
              data={areaChartData} 
              dataKeys={['revenue']}
              colors={['#0088FE']}
              currency={activeFilters.currency || "USD"}
              formatter={(value) => formatCurrency(value, activeFilters.currency || "USD")}
            />
          </CardContent>
        </Card>
      )}

      {/* Projects by Client Table */}
      {dashboardData?.projects_by_client && dashboardData.projects_by_client.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Clients ranked by total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.projects_by_client.map((client: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{client.client_name}</TableCell>
                    <TableCell className="text-right">{client.project_count}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(client.total_revenue, activeFilters.currency || "USD")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Costs</CardTitle>
            <CardDescription>Internal costs across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.total_costs || 0, activeFilters.currency || "USD")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
            <CardDescription>Estimated profit (Revenue - Costs)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.total_profit || 0, activeFilters.currency || "USD")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blended Cost Rate</CardTitle>
            <CardDescription>Average cost per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costRateData?.blended_cost_rate || 0, "USD")}/hr
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {costRateData?.active_team_members || 0} active team members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Advisor */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <AIAdvisor />
        </div>
      </div>
    </div>
  )
}
