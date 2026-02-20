
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNougram } from '@/context/NougramCoreContext';
import { TeamMember, FixedCost, SocialChargesConfig, GlobalConfig, BCRCalculation } from '@/types/admin';
import { adminApi } from '@/services/adminApi';

// Initial Mock Data (to avoid starting empty)
const DEFAULT_SOCIAL_CHARGES: SocialChargesConfig = {
    enable_social_charges: true,
    health_percentage: 8.5,
    pension_percentage: 12.0,
    arl_percentage: 0.522,
    parafiscales_percentage: 4.0,
    prima_services_percentage: 8.33,
    cesantias_percentage: 8.33,
    int_cesantias_percentage: 1.0,
    vacations_percentage: 4.17,
    total_percentage: 52.852
};

const DEFAULT_GLOBAL: GlobalConfig = {
    primary_currency: 'COP',
    default_billable_hours_per_week: 32,
    default_non_billable_percentage: "0.20",
    default_margin_target: "0.40"
};

interface AdminContextType {
    teamMembers: TeamMember[];
    fixedCosts: FixedCost[];
    socialCharges: SocialChargesConfig;
    globalSettings: GlobalConfig;
    bcr: BCRCalculation;
    isLoading: boolean;
    error: string | null;

    // Actions
    addTeamMember: (member: TeamMember) => Promise<void>;
    updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<void>;
    deleteTeamMember: (id: string) => Promise<void>;

    addFixedCost: (cost: FixedCost) => Promise<void>;
    updateFixedCost: (id: string, cost: Partial<FixedCost>) => Promise<void>;
    deleteFixedCost: (id: string) => Promise<void>;

    updateSocialCharges: (config: SocialChargesConfig) => void;
    updateGlobalSettings: (settings: Partial<GlobalConfig>) => void;
    refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [socialCharges, setSocialCharges] = useState<SocialChargesConfig>(DEFAULT_SOCIAL_CHARGES);
    const [globalSettings, setGlobalSettings] = useState<GlobalConfig>(DEFAULT_GLOBAL);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [bcr, setBcr] = useState<BCRCalculation>({
        totalMonthlyCosts: 0,
        totalBillableHours: 0,
        bcr: 0,
        totalPayroll: 0,
        totalFixedCosts: 0
    });

    const { updateFinancialBasics, refreshBCR } = useNougram();

    const refreshData = useCallback(async () => {
        if (!adminApi.hasAuth()) {
            setTeamMembers([]);
            setFixedCosts([]);
            setIsLoading(false);
            setError('Inicia sesión para ver nómina y gastos');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const [members, costs] = await Promise.all([
                adminApi.getTeamMembers(),
                adminApi.getFixedCosts()
            ]);
            setTeamMembers(members);
            setFixedCosts(costs);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar datos');
            setTeamMembers([]);
            setFixedCosts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        let totalPayroll = 0;
        let totalHours = 0;
        teamMembers.forEach(member => {
            if (!member.isActive) return;
            const chargesMult = member.applySocialCharges && socialCharges.enable_social_charges
                ? (1 + (socialCharges.total_percentage || 0) / 100)
                : 1;
            totalPayroll += member.salaryMonthlyBrute * chargesMult;
            totalHours += member.billableHoursPerWeek * 4.33 * (1 - member.nonBillablePercentage);
        });
        const totalFixed = fixedCosts.filter(c => c.isActive).reduce((sum, c) => sum + c.amountMonthly, 0);
        const totalMonthly = totalPayroll + totalFixed;
        const finalBCR = totalHours > 0 ? totalMonthly / totalHours : 0;
        setBcr({
            totalMonthlyCosts: totalMonthly,
            totalBillableHours: totalHours,
            bcr: finalBCR,
            totalPayroll,
            totalFixedCosts: totalFixed
        });
        updateFinancialBasics(totalMonthly, totalHours);
    }, [teamMembers, fixedCosts, socialCharges, updateFinancialBasics]);

    const addTeamMember = async (member: TeamMember) => {
        if (!adminApi.hasAuth()) throw new Error('Inicia sesión para agregar miembros');
        const created = await adminApi.createTeamMember({
            name: member.name,
            role: member.role,
            salaryMonthlyBrute: member.salaryMonthlyBrute,
            currency: member.currency,
            applySocialCharges: member.applySocialCharges,
            billableHoursPerWeek: member.billableHoursPerWeek,
            nonBillablePercentage: member.nonBillablePercentage,
            vacationDaysPerYear: member.vacationDaysPerYear,
            isActive: member.isActive
        });
        setTeamMembers(prev => [...prev, created]);
        await refreshBCR();
    };

    const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
        if (!adminApi.hasAuth() || !/^\d+$/.test(id)) throw new Error('Inicia sesión para editar');
        const updated = await adminApi.updateTeamMember(id, updates);
        setTeamMembers(prev => prev.map(m => m.id === id ? updated : m));
        await refreshBCR();
    };

    const deleteTeamMember = async (id: string) => {
        if (adminApi.hasAuth() && /^\d+$/.test(id)) {
            await adminApi.deleteTeamMember(id);
            await refreshBCR();
        }
        setTeamMembers(prev => prev.filter(m => m.id !== id));
    };

    const addFixedCost = async (cost: FixedCost) => {
        if (!adminApi.hasAuth()) throw new Error('Inicia sesión para agregar gastos');
        const created = await adminApi.createFixedCost({
            name: cost.name,
            category: cost.category,
            amountMonthly: cost.amountMonthly,
            currency: cost.currency,
            description: cost.description,
            isActive: cost.isActive
        });
        setFixedCosts(prev => [...prev, created]);
        await refreshBCR();
    };

    const updateFixedCost = async (id: string, updates: Partial<FixedCost>) => {
        if (!adminApi.hasAuth() || !/^\d+$/.test(id)) throw new Error('Inicia sesión para editar');
        const updated = await adminApi.updateFixedCost(id, updates);
        setFixedCosts(prev => prev.map(c => c.id === id ? updated : c));
        await refreshBCR();
    };

    const deleteFixedCost = async (id: string) => {
        if (adminApi.hasAuth() && /^\d+$/.test(id)) {
            await adminApi.deleteFixedCost(id);
            await refreshBCR();
        }
        setFixedCosts(prev => prev.filter(c => c.id !== id));
    };

    const updateSocialCharges = (cfg: SocialChargesConfig) => setSocialCharges(cfg);
    const updateGlobalSettings = (settings: Partial<GlobalConfig>) => setGlobalSettings(prev => ({ ...prev, ...settings }));

    return (
        <AdminContext.Provider value={{
            teamMembers,
            fixedCosts,
            socialCharges,
            globalSettings,
            bcr,
            isLoading,
            error,
            addTeamMember,
            updateTeamMember,
            deleteTeamMember,
            addFixedCost,
            updateFixedCost,
            deleteFixedCost,
            updateSocialCharges,
            updateGlobalSettings,
            refreshData
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within AdminProvider');
    return context;
};
