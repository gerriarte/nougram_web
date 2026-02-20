'use client';

import React from 'react';
import { TeamMemberList } from '@/components/admin/payroll/TeamMemberList';
import { SocialChargesConfig } from '@/components/admin/payroll/SocialChargesConfig';
import { useAdmin } from '@/context/AdminContext';

export default function PayrollPage() {
    const { isLoading, error } = useAdmin();

    return (
        <div className="space-y-8">
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
                    {error}
                </div>
            )}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Módulo de Nómina</h1>
                <p className="text-gray-500">Gestiona tu equipo humano y sus cargas prestacionales.</p>
            </div>

            {/* Social Charges Config (Above fold as requested in hierarchy level 3, but maybe nice to see summary first) 
                Actually spec says Level 1 is Summary (which is in sidebar now/header), Level 2 is List, Level 3 is Config.
                Let's put Config below List or side-by-side if space allows. 
                Vertical stacking is safer for complexity.
            */}

            <SocialChargesConfig />

            <TeamMemberList />
        </div>
    );
}
