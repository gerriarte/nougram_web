"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetServices, useCalculateSalesProjection } from "@/lib/queries"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { Loader2, TrendingUp, DollarSign, Briefcase, Target } from "lucide-react"
import { formatCurrency } from "@/lib/finance-utils"
import { KPICard } from "@/components/common/KPICard"

// Service type (inline definition)
interface Service {
  id: number
  name: string
  description?: string
  default_margin_target: number
  pricing_type?: string
}

interface SalesProjectionProps {
  currency: string
}

export function SalesProjection({ currency }: SalesProjectionProps) {
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [estimatedHours, setEstimatedHours] = useState<Record<number, number>>({})
  const [winRate, setWinRate] = useState<number>(0.85)
  const [scenario, setScenario] = useState<"conservative" | "realistic" | "optimistic">("realistic")
  const [periodMonths, setPeriodMonths] = useState<number>(12)

  const { data: servicesData, isLoading: servicesLoading } = useGetServices()
  const calculateProjection = useCalculateSalesProjection()

  const services: Service[] = servicesData || []

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        const newSelected = prev.filter(id => id !== serviceId)
        const newHours = { ...estimatedHours }
        delete newHours[serviceId]
        setEstimatedHours(newHours)
        return newSelected
      } else {
        return [...prev, serviceId]
      }
    })
  }

  const handleHoursChange = (serviceId: number, hours: number) => {
    setEstimatedHours(prev => ({
      ...prev,
      [serviceId]: hours
    }))
  }

  const handleCalculate = async () => {
    if (selectedServices.length === 0) {
      return
    }

    // Convert estimatedHours to the format expected by the API
    const estimatedHoursPerService: Record<string, number> = {}
    selectedServices.forEach(serviceId => {
      const hours = estimatedHours[serviceId] || 0
      if (hours > 0) {
        estimatedHoursPerService[serviceId.toString()] = hours
      }
    })

    await calculateProjection.mutateAsync({
      service_ids: selectedServices,
      estimated_hours_per_service: estimatedHoursPerService,
      win_rate: winRate,
      scenario,
      period_months: periodMonths,
      currency,
    })
  }

  const projection = calculateProjection.data
  const canCalculate = selectedServices.length > 0 && 
    selectedServices.every(id => estimatedHours[id] && estimatedHours[id] > 0)

  // Prepare chart data
  const monthlyChartData = useMemo(() => {
    if (!projection) return []
    
    return projection.monthly_projections.map(month => ({
      month: `Mes ${month.month}`,
      revenue: month.revenue,
      costs: month.costs,
      profit: month.profit,
    }))
  }, [projection])

  const serviceBreakdownData = useMemo(() => {
    if (!projection) return []
    
    return projection.service_projections.map(service => ({
      name: service.service_name,
      revenue: service.projected_revenue,
      cost: service.projected_cost,
      profit: service.projected_profit,
    }))
  }, [projection])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-grey-900">Proyección de Ventas</CardTitle>
          <CardDescription className="text-grey-600">
            Calcula proyecciones de ingresos basadas en servicios y capacidad del equipo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-4">
            <Label className="text-grey-700 font-medium">Seleccionar Servicios</Label>
            {servicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {services.map(service => (
                  <div key={service.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="h-4 w-4 rounded border-grey-300"
                    />
                    <Label 
                      htmlFor={`service-${service.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-grey-600">{service.description}</div>
                      )}
                    </Label>
                    {selectedServices.includes(service.id) && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Horas"
                          value={estimatedHours[service.id] || ''}
                          onChange={(e) => handleHoursChange(service.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-grey-600">horas</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="win-rate">Tasa de Cierre (%)</Label>
              <Input
                id="win-rate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={(winRate * 100).toString()}
                onChange={(e) => setWinRate(parseFloat(e.target.value) / 100 || 0)}
              />
              <p className="text-xs text-grey-600">Porcentaje de proyectos ganados</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario">Escenario</Label>
              <Select value={scenario} onValueChange={(value: any) => setScenario(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservador (70%)</SelectItem>
                  <SelectItem value="realistic">Realista (85%)</SelectItem>
                  <SelectItem value="optimistic">Optimista (100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Período (meses)</Label>
              <Select 
                value={periodMonths.toString()} 
                onValueChange={(value) => setPeriodMonths(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={handleCalculate}
            disabled={!canCalculate || calculateProjection.isPending}
            className="w-full"
          >
            {calculateProjection.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Calcular Proyección
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {projection && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Revenue Total"
              value={formatCurrency(projection.summary.total_revenue, currency)}
              icon={DollarSign}
            />
            <KPICard
              title="Costos Total"
              value={formatCurrency(projection.summary.total_costs, currency)}
              icon={Briefcase}
            />
            <KPICard
              title="Profit Total"
              value={formatCurrency(projection.summary.total_profit, currency)}
              icon={TrendingUp}
            />
            <KPICard
              title="Margen"
              value={`${projection.summary.overall_margin_percentage.toFixed(1)}%`}
              description={`Utilización: ${projection.summary.capacity_utilization_percentage.toFixed(1)}%`}
              icon={Target}
            />
          </div>

          {/* Monthly Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Proyección Mensual</CardTitle>
              <CardDescription>
                Revenue, costos y profit por mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={monthlyChartData}
                dataKeys={['revenue', 'costs', 'profit']}
                height={300}
                currency={currency}
              />
            </CardContent>
          </Card>

          {/* Service Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose por Servicio</CardTitle>
              <CardDescription>
                Revenue proyectado por servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={serviceBreakdownData.map(item => ({
                  name: item.name,
                  revenue: item.revenue,
                  cost: item.cost,
                  profit: item.profit,
                }))}
                height={300}
                currency={currency}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

