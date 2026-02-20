
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Equipment } from '@/types/equipment';
import { calculateDepreciation } from '@/lib/depreciation';
import { fetchBCR } from '@/services/bcrApi';
import { getToken } from '@/lib/api-client';

// --- Types ---

import { UserRole } from '@/types/user';
export type Currency = 'COP' | 'USD';

export interface AgencyIdentity {
    name: string;
    logo?: string;
    primaryCurrency: Currency;
}

export interface FinancialState {
    baseMonthlyCost: number; // From Onboarding (Payroll + Overhead)
    billableHours: number;   // Total capacity
    equipmentAmortization: number; // Calculated from active equipment
    bcr: number; // Final Result: (Base + Amortization) / Hours
    exchangeRateCOP: number;
}

export interface NougramState {
    identity: AgencyIdentity;
    financials: FinancialState;
    equipment: Equipment[]; // Inventory
    user: {
        role: UserRole;
        credits: number;
    };
    isHydrated: boolean;
}

// --- Context ---
interface NougramCoreContextType {
    state: NougramState;

    // Actions
    updateIdentity: (identity: Partial<AgencyIdentity>) => void;
    updateFinancialBasics: (baseCost: number, hours: number) => void;
    refreshBCR: () => Promise<void>;

    // Equipment Actions
    addEquipment: (item: Equipment) => void;
    updateEquipment: (id: string, updates: Partial<Equipment>) => void;
    removeEquipment: (id: string) => void;

    updateCredits: (newCredits: number) => void;
    switchRole: (role: UserRole) => void;
    hydrateFromOnboarding: (data: any) => void;
}

const DEFAULT_STATE: NougramState = {
    identity: { name: 'Mi Agencia', primaryCurrency: 'COP' },
    financials: {
        baseMonthlyCost: 0,
        billableHours: 160,
        equipmentAmortization: 0,
        bcr: 0,
        exchangeRateCOP: 4200
    },
    equipment: [],
    user: { role: 'owner', credits: 100 },
    isHydrated: false
};

const NougramCoreContext = createContext<NougramCoreContextType | undefined>(undefined);

export function NougramCoreProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<NougramState>(DEFAULT_STATE);
    const [apiBcrData, setApiBcrData] = useState<{
        blendedCostRate: number;
        totalMonthlyCosts: number;
        totalMonthlyHours: number;
    } | null>(null);

    const loadBCRFromApi = useCallback(async () => {
        if (!getToken()) return;
        const data = await fetchBCR();
        if (data && parseFloat(data.total_monthly_hours?.toString() || '0') > 0) {
            setApiBcrData({
                blendedCostRate: parseFloat(data.blended_cost_rate) || 0,
                totalMonthlyCosts: parseFloat(data.total_monthly_costs) || 0,
                totalMonthlyHours: parseFloat(String(data.total_monthly_hours)) || 0
            });
        } else {
            setApiBcrData(null);
        }
    }, []);

    // Initial load: API BCR when auth; no localStorage fallback
    useEffect(() => {
        if (getToken()) {
            loadBCRFromApi();
        }
        setState(prev => ({ ...prev, isHydrated: true }));
    }, [loadBCRFromApi]);

    // BCR Recalculation: use API when available, else local
    useEffect(() => {
        let totalAmortization = 0;
        state.equipment.forEach(eq => {
            if (eq.isActive) {
                totalAmortization += calculateDepreciation(eq).monthlyDepreciation;
            }
        });

        if (apiBcrData) {
            const hours = apiBcrData.totalMonthlyHours;
            const equipmentPerHour = hours > 0 ? totalAmortization / hours : 0;
            const newBCR = apiBcrData.blendedCostRate + equipmentPerHour;
            setState(prev => {
                const next = {
                    ...prev,
                    financials: {
                        ...prev.financials,
                        baseMonthlyCost: apiBcrData.totalMonthlyCosts,
                        billableHours: hours,
                        equipmentAmortization: totalAmortization,
                        bcr: newBCR
                    },
                    isHydrated: true
                };
                if (prev.financials.bcr === next.financials.bcr && prev.financials.equipmentAmortization === totalAmortization) return prev;
                return next;
            });
        } else {
            const { baseMonthlyCost, billableHours } = state.financials;
            const newBCR = billableHours > 0 ? (baseMonthlyCost + totalAmortization) / billableHours : 0;
            if (state.financials.bcr !== newBCR || state.financials.equipmentAmortization !== totalAmortization) {
                setState(prev => ({
                    ...prev,
                    financials: {
                        ...prev.financials,
                        equipmentAmortization: totalAmortization,
                        bcr: newBCR
                    }
                }));
            }
        }
    }, [apiBcrData, state.financials.baseMonthlyCost, state.financials.billableHours, state.equipment]);


    const updateIdentity = (id: Partial<AgencyIdentity>) =>
        setState(prev => ({ ...prev, identity: { ...prev.identity, ...id } }));

    const updateFinancialBasics = (baseCost: number, hours: number) => {
        if (!apiBcrData) {
            setState(prev => ({ ...prev, financials: { ...prev.financials, baseMonthlyCost: baseCost, billableHours: hours } }));
        }
    };

    const refreshBCR = useCallback(async () => {
        await loadBCRFromApi();
    }, [loadBCRFromApi]);

    // Equipment Actions
    const addEquipment = (item: Equipment) =>
        setState(prev => ({ ...prev, equipment: [...prev.equipment, item] }));

    const updateEquipment = (id: string, updates: Partial<Equipment>) =>
        setState(prev => ({ ...prev, equipment: prev.equipment.map(e => e.id === id ? { ...e, ...updates } : e) }));

    const removeEquipment = (id: string) =>
        setState(prev => ({ ...prev, equipment: prev.equipment.filter(e => e.id !== id) }));


    const updateCredits = (newCredits: number) =>
        setState(prev => ({ ...prev, user: { ...prev.user, credits: newCredits } }));

    const switchRole = (role: UserRole) =>
        setState(prev => ({ ...prev, user: { ...prev.user, role } }));

    const hydrateFromOnboarding = (data: any) => {
        // Reverse engineer basics from onboarding data logic
        // Assuming data.bcr.hoursBased was the OLD Calc
        const bcrValue = parseFloat(data.bcr?.hoursBased || '0') || 50000;
        const hours = 160; // Default capacity assumption if missing

        // Reverse base cost: Cost = BCR * Hours
        const baseMonthlyCost = bcrValue * hours;

        const name = data.identity?.name || 'Agencia';
        const currency = data.identity?.currency || 'COP';

        setState(prev => ({
            ...prev,
            identity: { ...prev.identity, name, primaryCurrency: currency },
            financials: {
                ...prev.financials,
                baseMonthlyCost,
                billableHours: hours,
                bcr: bcrValue
            },
            isHydrated: true
        }));
    };

    return (
        <NougramCoreContext.Provider value={{
            state,
            updateIdentity,
            updateFinancialBasics,
            refreshBCR,
            addEquipment,
            updateEquipment,
            removeEquipment,
            updateCredits,
            switchRole,
            hydrateFromOnboarding
        }}>
            {children}
        </NougramCoreContext.Provider>
    );
}

export const useNougram = () => {
    const context = useContext(NougramCoreContext);
    if (!context) throw new Error('useNougram must be used within NougramCoreProvider');
    return context;
};
