
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QuoteSendView } from '@/components/quotes/QuoteSendView';
import { quoteService } from '@/services/quoteService';
import { Quote } from '@/components/dashboard/QuoteCard';

export default function SendQuotePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQuote = async () => {
            if (!id) return;
            const data = await quoteService.getById(id);
            setQuote(data);
            setLoading(false);
        };
        loadQuote();
    }, [id]);

    const handleSend = async (data: any) => {
        if (!id) return;
        try {
            await quoteService.sendEmail(id, data);
            // Navigate back to dashboard or to tracking view
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to send quote", error);
            alert("Error al enviar la cotización");
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    if (!quote) {
        return <div className="flex h-screen items-center justify-center">Cotización no encontrada</div>;
    }

    return (
        <QuoteSendView
            quote={quote}
            onSend={handleSend}
            onCancel={() => router.back()}
        />
    );
}
