"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RentabilityDataPoint {
    name: string;
    value: number;
    color: string;
}

interface RentabilityDonutChartProps {
    data: RentabilityDataPoint[];
}

export const RentabilityDonutChart = ({ data }: RentabilityDonutChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-grey-400">
                No hay datos suficientes para el gráfico
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '8px 12px'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
