import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TeamMember {
  name: string;
  role: string;
  salary: number;
  billableHours: number;
  currency?: string;
}

export interface TaxStructure {
  iva?: number;
  ica?: number;
  retentions?: number;
  // Colombia específico - cargas prestacionales
  health?: number;
  pension?: number;
  arl?: number;
  parafiscales?: number;
}

interface OnboardingState {
  // Paso 1: Localización
  country: string;
  currency: string;
  enableSocialCharges: boolean; // Ley 100 para Colombia
  
  // Paso 2: Perfilamiento
  profileType: 'freelance' | 'professional' | 'company' | null;
  monthlyIncomeTarget?: number; // Para freelance
  vacationDays?: number; // Para freelance
  teamMembers: TeamMember[]; // Para empresa
  
  // Paso 3: Estructura Tributaria
  taxes: TaxStructure;
  
  // Métodos
  setCountry: (country: string) => void;
  setCurrency: (currency: string) => void;
  setEnableSocialCharges: (enable: boolean) => void;
  setProfileType: (type: 'freelance' | 'professional' | 'company') => void;
  setMonthlyIncomeTarget: (amount: number) => void;
  setVacationDays: (days: number) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (index: number) => void;
  updateTeamMember: (index: number, member: Partial<TeamMember>) => void;
  setTaxes: (taxes: Partial<TaxStructure>) => void;
  reset: () => void;
}

const initialState = {
  country: '',
  currency: 'USD',
  enableSocialCharges: false,
  profileType: null,
  teamMembers: [],
  taxes: {},
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setCountry: (country) => {
        set({ country });
        // Si el país es Colombia, activar automáticamente el switch de cargas prestacionales
        if (country === 'COL') {
          set({ enableSocialCharges: true });
        } else {
          set({ enableSocialCharges: false });
        }
      },
      setCurrency: (currency) => set({ currency }),
      setEnableSocialCharges: (enable) => set({ enableSocialCharges: enable }),
      setProfileType: (type) => set({ profileType: type }),
      setMonthlyIncomeTarget: (amount) => set({ monthlyIncomeTarget: amount }),
      setVacationDays: (days) => set({ vacationDays: days }),
      addTeamMember: (member) => set((state) => ({
        teamMembers: [...state.teamMembers, member]
      })),
      removeTeamMember: (index) => set((state) => ({
        teamMembers: state.teamMembers.filter((_, i) => i !== index)
      })),
      updateTeamMember: (index, member) => set((state) => ({
        teamMembers: state.teamMembers.map((m, i) => 
          i === index ? { ...m, ...member } : m
        )
      })),
      setTaxes: (taxes) => set((state) => ({
        taxes: { ...state.taxes, ...taxes }
      })),
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);



