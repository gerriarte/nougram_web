
'use client';

import React from 'react';
import { AdminProvider } from '@/context/AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { BCRSummaryCard } from './BCRSummaryCard';
import { AdminHeader } from './AdminHeader';
import { AuthGuard } from '@/components/auth/AuthGuard';

export function AdminLayout({ children, hideRightPanel = false }: { children: React.ReactNode, hideRightPanel?: boolean }) {
    return (
        <AuthGuard>
        <AdminProvider>
            <div className="flex min-h-screen bg-background">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <AdminHeader />

                    <main className="flex-1 p-12">
                        <div className="flex gap-12 items-start max-w-[1600px] mx-auto">
                            <div className="flex-1 min-w-0">
                                {children}
                            </div>

                            {/* Right Column / BCR Card - "Always Visible" unless hidden */}
                            {!hideRightPanel && (
                                <div className="w-80 flex-shrink-0 hidden xl:block sticky top-32">
                                    <BCRSummaryCard />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </AdminProvider>
        </AuthGuard>
    );
}

