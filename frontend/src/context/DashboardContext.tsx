
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNougram } from '@/context/NougramCoreContext';
import { Quote, DashboardMetrics, QuoteStatus } from '@/types/dashboard';

import { quoteStorage } from '@/services/quoteStorage';

interface DashboardContextType {
    quotes: Quote[];
    metrics: DashboardMetrics;
    updateQuoteStatus: (id: string, status: QuoteStatus) => void;
    refreshQuotes: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalQuoted: 0, pipelineValue: 0, winRate: 0, avgMargin: 0,
        sentCount: 0, sentValue: 0, wonCount: 0, wonValue: 0, lostCount: 0, netIncome: 0
    });

    const { state: coreState } = useNougram();

    // Fetch on Mount
    useEffect(() => {
        refreshQuotes();
    }, []);

    const refreshQuotes = async () => {
        const data = await quoteStorage.getAll();
        setQuotes(data);
    };


    // Calculate Metrics on change
    useEffect(() => {
        const total = quotes.reduce((sum, q) => sum + q.amount, 0);

        const pipeline = quotes
            .filter(q => q.status === 'Sent' || q.status === 'Viewed')
            .reduce((sum, q) => sum + q.amount, 0);

        const sentQuotes = quotes.filter(q => q.status === 'Sent' || q.status === 'Viewed');
        const sentCount = sentQuotes.length;
        const sentValue = sentQuotes.reduce((sum, q) => sum + q.amount, 0);

        const closed = quotes.filter(q => q.status === 'Accepted' || q.status === 'Rejected');
        const wins = quotes.filter(q => q.status === 'Accepted');
        const wonCount = wins.length;
        const wonValue = wins.reduce((sum, q) => sum + q.amount, 0);
        const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

        const losses = quotes.filter(q => q.status === 'Rejected');
        const lostCount = losses.length;

        // Calculate Net Income from Won Deals
        // estimate: Amount * (Margin% / 100)
        const netIncome = wins.reduce((sum, q) => {
            const margin = q.marginPercentage || 0;
            return sum + (q.amount * (margin / 100));
        }, 0);

        const margins = quotes.map(q => q.marginPercentage);
        const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;

        setMetrics({
            totalQuoted: total,
            pipelineValue: pipeline,
            winRate,
            avgMargin,
            sentCount,
            sentValue,
            wonCount,
            wonValue,
            lostCount,
            netIncome
        });
    }, [quotes]);


    const updateQuoteStatus = async (id: string, status: QuoteStatus) => {
        // Optimistic UI Update
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));

        // Persist
        try {
            await quoteStorage.update(id, { status });
        } catch (e) {
            console.error("Failed to update status", e);
            refreshQuotes(); // Revert on error
        }
    };

    return (
        <DashboardContext.Provider value={{ quotes, metrics, updateQuoteStatus, refreshQuotes }}>
            {children}
        </DashboardContext.Provider>
    );
}

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within DashboardProvider');
    return context;
};
