// Type definitions for AgenciaOps

export type ProjectStatus = 'draft' | 'sent' | 'won' | 'lost' | 'archived';

export interface Project {
  id: string;
  name: string;
  client: string;
  clientEmail?: string;
  status: ProjectStatus;
  currency: string;
  subtotal: number;
  taxes: number;
  total: number;
  margin: number;
  createdAt: Date;
  updatedAt: Date;
  services: QuoteService[];
}

export interface QuoteService {
  id: string;
  serviceId: string;
  serviceName: string;
  hours: number;
  hourlyRate: number;
  cost: number;
  subtotal: number;
}

export interface Service {
  id: string;
  name: string;
  defaultHourlyRate: number;
  category: string;
}

export interface TeamCost {
  id: string;
  name: string; // Role name
  hourlyRate: number;
  weeklyHours: number;
  monthlyCost: number;
  isActive: boolean;
}

// Alias for backward compatibility if needed, but we will migrate
export type Cost = TeamCost;

export interface CompanyCost {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
  frequency: 'monthly' | 'yearly';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  costId?: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  suggestedRoles: TeamCost[];
  suggestedServices: Service[];
  suggestedCompanyCosts: CompanyCost[];
}
