
'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BillingDashboard } from '@/components/billing/BillingDashboard';

export default function BillingPage() {
    return (
        <AuthGuard>
            <BillingDashboard />
        </AuthGuard>
    );
}
