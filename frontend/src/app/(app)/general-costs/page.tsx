"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, TrendingUp, PieChart as PieChartIcon } from "lucide-react"
import { useGetFixedCosts } from "@/lib/queries"
import { formatCurrency } from "@/lib/currency"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ErrorDisplay } from "@/components/common/ErrorDisplay"

interface FixedCost {
    id: number
    name: string
    amount_monthly: number
    currency?: string
    category: string
    created_at: string
    updated_at: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function GeneralCostsPage() {
    const { data, isLoading, error } = useGetFixedCosts()
    const costs = ((data as any)?.items && Array.isArray((data as any).items)) ? (data as any).items : []

    const stats = useMemo(() => {
        if (!costs.length) return null

        // Group by currency to avoid mixing currencies for now
        // Ideally we would convert everything to one currency, but we'll specificy the main one or list both
        const currency = costs[0]?.currency || "USD"

        // Filter costs by the main currency for the charts to make sense
        // or just assume one currency for this dashboard version as per current simple implementation
        const sameCurrencyCosts = costs.filter((c: FixedCost) => (c.currency || "USD") === currency)

        const totalMonthly = sameCurrencyCosts.reduce((sum: number, cost: FixedCost) => sum + cost.amount_monthly, 0)
        const totalYearly = totalMonthly * 12

        // Group by Category
        const byCategory = sameCurrencyCosts.reduce((acc: Record<string, number>, cost: FixedCost) => {
            acc[cost.category] = (acc[cost.category] || 0) + cost.amount_monthly
            return acc
        }, {} as Record<string, number>)

        const chartData = Object.entries(byCategory).map(([name, value]) => ({
            name,
            value: value as number
        })).sort((a: { value: number }, b: { value: number }) => b.value - a.value)

        return {
            currency,
            totalMonthly,
            totalYearly,
            chartData,
            count: sameCurrencyCosts.length
        }
    }, [costs])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return <ErrorDisplay error={error} title="Error al cargar costos generales" />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Resumen de Costos Generales</h1>
                <p className="text-muted-foreground">Visión general de los costos fijos y operativos de la empresa</p>
            </div>

            {!stats ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No hay costos registrados aún.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Costo Mensual Total</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalMonthly, stats.currency)}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{formatCurrency(stats.totalMonthly, stats.currency)} al mes en gastos recurrentes
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Proyección Anual</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalYearly, stats.currency)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Estimado basado en costos actuales
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Items</CardTitle>
                                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.count}</div>
                                <p className="text-xs text-muted-foreground">
                                    Servicios y costos registrados
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Distribución por Categoría</CardTitle>
                                <CardDescription>Desglose de gastos mensuales</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {stats.chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value?: number) => formatCurrency(value ?? 0, stats.currency)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Top Costos</CardTitle>
                                <CardDescription>Los 5 gastos más elevados</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {costs
                                        .sort((a: FixedCost, b: FixedCost) => b.amount_monthly - a.amount_monthly)
                                        .slice(0, 5)
                                        .map((cost: FixedCost) => (
                                            <div key={cost.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <DollarSign className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{cost.name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{cost.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(cost.amount_monthly, cost.currency || "USD")}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
