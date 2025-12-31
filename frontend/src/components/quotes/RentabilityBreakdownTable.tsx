"use client";

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface RentabilityCategory {
    category: string;
    concept: string;
    amount: number;
    percentage: number;
    description?: string;
}

interface RentabilityBreakdownTableProps {
    categories: RentabilityCategory[];
    onExport?: () => void;
}

export const RentabilityBreakdownTable = ({ categories, onExport }: RentabilityBreakdownTableProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-grey-900">Desglose Detallado</h3>
                {onExport && (
                    <Button variant="outline" size="sm" onClick={onExport} className="text-grey-600 border-grey-300">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                )}
            </div>

            <div className="rounded-xl border border-grey-200 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-grey-50">
                        <TableRow>
                            <TableHead className="text-grey-600 font-semibold py-4">Categoría</TableHead>
                            <TableHead className="text-grey-600 font-semibold py-4">Concepto</TableHead>
                            <TableHead className="text-right text-grey-600 font-semibold py-4">Monto</TableHead>
                            <TableHead className="text-right text-grey-600 font-semibold py-4">% s/ Bruto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((item, index) => (
                            <TableRow key={index} className="hover:bg-grey-50/50 transition-colors">
                                <TableCell className="font-medium text-grey-700 py-4">{item.category}</TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2 text-grey-600">
                                        {item.concept}
                                        {item.description && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button type="button" className="inline-flex">
                                                            <Info className="h-4 w-4 text-grey-400 cursor-help" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <p className="text-xs leading-relaxed">{item.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-grey-900 py-4">
                                    ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-grey-100 text-grey-800">
                                        {item.percentage}%
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
