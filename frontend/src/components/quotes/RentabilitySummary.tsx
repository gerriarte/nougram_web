"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Ban } from "lucide-react";
import { useGetQuoteRentability } from "@/lib/queries";
import { RentabilityDonutChart } from "./RentabilityDonutChart";
import { RentabilityBreakdownTable } from "./RentabilityBreakdownTable";
import { formatCurrency } from "@/lib/currency";

interface RentabilityCategory {
    category: string;
    concept: string;
    amount: number;
    percentage: number;
    description?: string;
}

interface RentabilityAnalysis {
    quote_id: number;
    total_client_price: number;
    total_internal_cost: number;
    total_taxes: number;
    net_profit_amount: number;
    net_profit_margin: number;
    status: 'healthy' | 'warning' | 'critical';
    categories: RentabilityCategory[];
}

interface RentabilitySummaryProps {
    quoteId: number;
    currency?: string;
}

export const RentabilitySummary = ({ quoteId, currency = "USD" }: RentabilitySummaryProps) => {
    const { data, isLoading, error } = useGetQuoteRentability(quoteId);
    const analysis = data as RentabilityAnalysis;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-grey-400" />
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <Card className="border-red-100 bg-red-50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                        <Ban className="h-5 w-5" />
                        <p>No se pudo cargar el análisis de rentabilidad para esta versión.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "healthy":
                return {
                    label: "Saludable",
                    color: "bg-green-100 text-green-700",
                    icon: <CheckCircle className="h-4 w-4" />,
                    description: "Margen óptimo por encima del 30%"
                };
            case "warning":
                return {
                    label: "Aceptable con Riesgo",
                    color: "bg-yellow-100 text-yellow-700",
                    icon: <AlertTriangle className="h-4 w-4" />,
                    description: "Margen por debajo del 30%, revisar optimización"
                };
            case "critical":
                return {
                    label: "Nivel Crítico",
                    color: "bg-red-100 text-red-700",
                    icon: <Ban className="h-4 w-4" />,
                    description: "Margen por debajo del 15%, inviable o alto riesgo"
                };
            default:
                return { label: status, color: "bg-grey-100", icon: null, description: "" };
        }
    };

    const statusConfig = getStatusConfig(analysis.status);

    // Prepare chart data
    const chartData = analysis.categories
        .filter((cat: any) => cat.category !== "Carga Tributaria")
        .map((cat: any) => ({
            name: cat.concept,
            value: cat.amount,
            color: cat.concept === "Talento y Recursos" ? "#2563eb" :
                cat.concept === "Overhead Fijo" ? "#7c3aed" :
                    cat.concept === "Software y Herramientas" ? "#db2777" :
                        cat.concept === "Gastos de Terceros / Materiales" ? "#ea580c" : "#94a3b8"
        }));

    // Add Profit and Taxes to chart
    chartData.push({ name: "Utilidad Neta", value: Math.max(0, analysis.net_profit_amount), color: "#16a34a" });
    chartData.push({ name: "Carga Tributaria", value: analysis.total_taxes, color: "#475569" });

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="shadow-sm border-grey-200">
                    <CardContent className="pt-6">
                        <p className="text-[10px] uppercase font-bold text-grey-500 mb-1">Precio Bruto</p>
                        <p className="text-2xl font-bold text-grey-900">{formatCurrency(analysis.total_client_price, currency)}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-grey-200">
                    <CardContent className="pt-6">
                        <p className="text-[10px] uppercase font-bold text-grey-500 mb-1">Costo Operativo</p>
                        <p className="text-2xl font-bold text-grey-900">{formatCurrency(analysis.total_internal_cost, currency)}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-grey-200">
                    <CardContent className="pt-6">
                        <p className="text-[10px] uppercase font-bold text-grey-500 mb-1">Utilidad Neta</p>
                        <p className={`text-2xl font-bold ${analysis.net_profit_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(analysis.net_profit_amount, currency)}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm border-t-4 ${analysis.status === 'healthy' ? 'border-t-green-500' : analysis.status === 'warning' ? 'border-t-yellow-500' : 'border-t-red-500'}`}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] uppercase font-bold text-grey-500">Margen Real</p>
                            <Badge variant="outline" className={`${statusConfig.color} border-none font-bold text-[10px] px-2 py-0 h-5`}>
                                <span className="flex items-center gap-1">
                                    {statusConfig.icon}
                                    {statusConfig.label}
                                </span>
                            </Badge>
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{analysis.net_profit_margin}%</p>
                        <p className="text-[10px] text-grey-400 mt-1 line-clamp-1">{statusConfig.description}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm border-grey-200 overflow-hidden">
                    <CardHeader className="bg-grey-50/50 border-b border-grey-100">
                        <CardTitle className="text-base font-semibold">Anatomía Financiera</CardTitle>
                        <CardDescription className="text-xs">Distribución del valor total de la propuesta</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <RentabilityDonutChart data={chartData} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-grey-200 overflow-hidden">
                    <CardHeader className="bg-grey-50/50 border-b border-grey-100">
                        <CardTitle className="text-base font-semibold">Detalle de Egresos</CardTitle>
                        <CardDescription className="text-xs">Desglose por categorías y conceptos</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 px-0">
                        <RentabilityBreakdownTable categories={analysis.categories} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
