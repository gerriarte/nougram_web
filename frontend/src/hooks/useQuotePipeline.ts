import { useState, useEffect } from 'react';
import { Quote } from '@/components/dashboard/QuoteCard';
import { quoteService } from '../services/quoteService';


export interface QuoteFilters {
    status: Quote['status'][];
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    minAmount: number | '';
    maxAmount: number | '';
    client: string;
}

export function useQuotePipeline() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
    const [loading, setLoading] = useState(true);

    // Advanced Filters State
    const [filters, setFilters] = useState<QuoteFilters>({
        status: [],
        dateRange: { start: null, end: null },
        minAmount: '',
        maxAmount: '',
        client: ''
    });

    useEffect(() => {
        const loadQuotes = async () => {
            setLoading(true);
            try {
                const data = await quoteService.getAll();
                setQuotes(data);
            } catch (error) {
                console.error("Failed to load quotes", error);
            } finally {
                setLoading(false);
            }
        };
        loadQuotes();
    }, []);

    const handleStatusChange = async (id: string, newStatus: Quote['status']) => {
        // Optimistic update
        setQuotes(prevQuotes => prevQuotes.map(quote =>
            quote.id === id ? { ...quote, status: newStatus } : quote
        ));

        try {
            await quoteService.updateStatus(id, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on failure could be implemented here
        }
    };

    const updateFilter = (key: keyof QuoteFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: [],
            dateRange: { start: null, end: null },
            minAmount: '',
            maxAmount: '',
            client: ''
        });
        setSearch('');
    };

    const filteredQuotes = quotes.filter(q => {
        // 1. Text Search
        if (search) {
            const searchLower = search.toLowerCase();
            const matchesProject = q.project.toLowerCase().includes(searchLower);
            const matchesClient = q.client.toLowerCase().includes(searchLower);
            if (!matchesProject && !matchesClient) return false;
        }

        // 2. Status Filter
        if (filters.status.length > 0 && !filters.status.includes(q.status)) {
            return false;
        }

        // 3. Client Filter
        if (filters.client && q.client !== filters.client) {
            return false;
        }

        // 4. Amount Range
        if (filters.minAmount !== '' && q.amount < filters.minAmount) return false;
        if (filters.maxAmount !== '' && q.amount > filters.maxAmount) return false;

        // 5. Date Filter (Mock: assuming 'sentAt' is a parseable date or we use created_at)
        // For this mock simplified version, we'll skip complex date parsing unless 'sentAt' format is standardized.
        // Assuming 'sentAt' is "Hace 2d", this is hard to filter without real dates.
        // TODO: Implement Date Filter when backend provides ISO dates.

        return true;
    });

    const columns = [
        { id: 'draft', title: 'Borradores', color: 'bg-gray-100' },
        { id: 'sent', title: 'Enviadas', color: 'bg-blue-50' },
        { id: 'viewed', title: 'Vistas (Hot)', color: 'bg-yellow-50' },
        { id: 'accepted', title: 'Cerradas', color: 'bg-green-50' },
    ];

    return {
        quotes: filteredQuotes, // Return filtered directly or raw depending on need. Usually UI wants filtered.
        allQuotes: quotes,
        search,
        setSearch,
        viewMode,
        setViewMode,
        handleStatusChange,
        columns,
        loading,
        filters,
        updateFilter,
        clearFilters
    };
}
