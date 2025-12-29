import { Project, Service, TeamCost, CompanyCost, TeamMember, Currency, Tax, User } from './types';

// Mock Projects Data
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign for Tech Corp',
    client: 'Tech Corp Solutions',
    clientEmail: 'contact@techcorp.com',
    status: 'won',
    currency: 'USD',
    subtotal: 45000,
    taxes: 9000,
    total: 54000,
    margin: 35,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-01'),
    services: []
  },
  {
    id: '2',
    name: 'Mobile App Development',
    client: 'Startup Innovations',
    clientEmail: 'team@startup.io',
    status: 'sent',
    currency: 'USD',
    subtotal: 85000,
    taxes: 17000,
    total: 102000,
    margin: 42,
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-10'),
    services: []
  },
  {
    id: '3',
    name: 'Brand Identity Package',
    client: 'Creative Studios LLC',
    clientEmail: 'hello@creativestudios.com',
    status: 'draft',
    currency: 'USD',
    subtotal: 12000,
    taxes: 2400,
    total: 14400,
    margin: 28,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-12'),
    services: []
  },
  {
    id: '4',
    name: 'E-commerce Platform',
    client: 'Retail Giants Inc',
    clientEmail: 'projects@retailgiants.com',
    status: 'sent',
    currency: 'USD',
    subtotal: 125000,
    taxes: 25000,
    total: 150000,
    margin: 38,
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-12-08'),
    services: []
  },
  {
    id: '5',
    name: 'Marketing Campaign',
    client: 'Fashion Forward',
    clientEmail: 'marketing@fashionforward.com',
    status: 'lost',
    currency: 'USD',
    subtotal: 32000,
    taxes: 6400,
    total: 38400,
    margin: 25,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-11-10'),
    services: []
  },
  {
    id: '6',
    name: 'CRM System Integration',
    client: 'Enterprise Solutions',
    clientEmail: 'it@enterprise.com',
    status: 'won',
    currency: 'USD',
    subtotal: 68000,
    taxes: 13600,
    total: 81600,
    margin: 40,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-25'),
    services: []
  },
  {
    id: '7',
    name: 'Social Media Strategy',
    client: 'Lifestyle Brands Co',
    clientEmail: 'social@lifestylebrands.com',
    status: 'draft',
    currency: 'USD',
    subtotal: 18000,
    taxes: 3600,
    total: 21600,
    margin: 32,
    createdAt: new Date('2024-12-11'),
    updatedAt: new Date('2024-12-13'),
    services: []
  },
  {
    id: '8',
    name: 'Product Photography',
    client: 'Artisan Goods',
    clientEmail: 'info@artisangoods.com',
    status: 'sent',
    currency: 'USD',
    subtotal: 8500,
    taxes: 1700,
    total: 10200,
    margin: 45,
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-11'),
    services: []
  }
];

// Mock Services
export const mockServices: Service[] = [
  { id: '1', name: 'UI/UX Design', defaultHourlyRate: 120, category: 'Design' },
  { id: '2', name: 'Frontend Development', defaultHourlyRate: 140, category: 'Development' },
  { id: '3', name: 'Backend Development', defaultHourlyRate: 150, category: 'Development' },
  { id: '4', name: 'Project Management', defaultHourlyRate: 130, category: 'Management' },
  { id: '5', name: 'Quality Assurance', defaultHourlyRate: 100, category: 'Testing' },
  { id: '6', name: 'DevOps', defaultHourlyRate: 160, category: 'Infrastructure' },
  { id: '7', name: 'Brand Strategy', defaultHourlyRate: 135, category: 'Strategy' },
  { id: '8', name: 'Content Writing', defaultHourlyRate: 80, category: 'Content' },
  { id: '9', name: 'SEO Optimization', defaultHourlyRate: 110, category: 'Marketing' },
  { id: '10', name: 'Social Media Management', defaultHourlyRate: 90, category: 'Marketing' }
];

// Mock Team Costs
export const mockCosts: TeamCost[] = [
  { id: '1', name: 'Senior Developer', hourlyRate: 90, weeklyHours: 40, monthlyCost: 14400, isActive: true },
  { id: '2', name: 'Mid-Level Developer', hourlyRate: 60, weeklyHours: 40, monthlyCost: 9600, isActive: true },
  { id: '3', name: 'Junior Developer', hourlyRate: 40, weeklyHours: 40, monthlyCost: 6400, isActive: true },
  { id: '4', name: 'Senior Designer', hourlyRate: 80, weeklyHours: 40, monthlyCost: 12800, isActive: true },
  { id: '5', name: 'Mid-Level Designer', hourlyRate: 55, weeklyHours: 40, monthlyCost: 8800, isActive: true },
  { id: '6', name: 'Project Manager', hourlyRate: 85, weeklyHours: 40, monthlyCost: 13600, isActive: true },
  { id: '7', name: 'QA Specialist', hourlyRate: 50, weeklyHours: 40, monthlyCost: 8000, isActive: true },
  { id: '8', name: 'Content Writer', hourlyRate: 45, weeklyHours: 20, monthlyCost: 3600, isActive: true }
];

// Mock Company Costs
export const mockCompanyCosts: CompanyCost[] = [
  { id: '1', name: 'Office Rent', amount: 2500, type: 'fixed', frequency: 'monthly' },
  { id: '2', name: 'Software Licenses', amount: 800, type: 'fixed', frequency: 'monthly' },
  { id: '3', name: 'Marketing Budget', amount: 1500, type: 'variable', frequency: 'monthly' },
  { id: '4', name: 'Legal Services', amount: 5000, type: 'variable', frequency: 'yearly' },
  { id: '5', name: 'Internet & Utilities', amount: 300, type: 'fixed', frequency: 'monthly' }
];

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Developer', email: 'sarah@agenciaops.com', costId: '1' },
  { id: '2', name: 'Michael Chen', role: 'UI/UX Designer', email: 'michael@agenciaops.com', costId: '4' },
  { id: '3', name: 'Emily Rodriguez', role: 'Project Manager', email: 'emily@agenciaops.com', costId: '6' },
  { id: '4', name: 'David Kim', role: 'Backend Developer', email: 'david@agenciaops.com', costId: '2' },
  { id: '5', name: 'Lisa Wang', role: 'Frontend Developer', email: 'lisa@agenciaops.com', costId: '2' },
  { id: '6', name: 'James Miller', role: 'QA Specialist', email: 'james@agenciaops.com', costId: '7' }
];

// Mock Currencies
export const mockCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' }
];

// Mock Taxes
export const mockTaxes: Tax[] = [
  { id: '1', name: 'Standard VAT (20%)', rate: 20, isDefault: true },
  { id: '2', name: 'Reduced VAT (10%)', rate: 10, isDefault: false },
  { id: '3', name: 'Sales Tax (8.5%)', rate: 8.5, isDefault: false },
  { id: '4', name: 'No Tax', rate: 0, isDefault: false }
];

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Alex Thompson', email: 'alex@agenciaops.com', role: 'admin' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@agenciaops.com', role: 'manager' },
  { id: '3', name: 'Michael Chen', email: 'michael@agenciaops.com', role: 'member' },
  { id: '4', name: 'Emily Rodriguez', email: 'emily@agenciaops.com', role: 'manager' },
  { id: '5', name: 'David Kim', email: 'david@agenciaops.com', role: 'member' }
];

// Current user
export const currentUser: User = mockUsers[0];

import { IndustryTemplate } from './types';

// Mock Industry Templates
export const mockIndustryTemplates: IndustryTemplate[] = [
  {
    id: 'branding',
    name: 'Branding Agency',
    description: 'Graphic design, visual identity, packaging',
    icon: 'Palette',
    color: 'bg-purple-500',
    suggestedRoles: [
      { id: 't1', name: 'Creative Director', hourlyRate: 150, weeklyHours: 40, monthlyCost: 24000, isActive: true },
      { id: 't2', name: 'Senior Designer', hourlyRate: 90, weeklyHours: 40, monthlyCost: 14400, isActive: true },
      { id: 't3', name: 'Brand Strategist', hourlyRate: 110, weeklyHours: 40, monthlyCost: 17600, isActive: true }
    ],
    suggestedServices: [
      { id: 's1', name: 'Brand Identity', defaultHourlyRate: 150, category: 'Design' },
      { id: 's2', name: 'Logo Design', defaultHourlyRate: 120, category: 'Design' },
      { id: 's3', name: 'Brand Guidelines', defaultHourlyRate: 130, category: 'Strategy' }
    ],
    suggestedCompanyCosts: [
      { id: 'c1', name: 'Adobe Creative Cloud', amount: 300, type: 'fixed', frequency: 'monthly' },
      { id: 'c2', name: 'Font Licenses', amount: 2000, type: 'variable', frequency: 'yearly' }
    ]
  },
  {
    id: 'dev',
    name: 'Software Development',
    description: 'Web development, apps, APIs, maintenance',
    icon: 'Code',
    color: 'bg-blue-500',
    suggestedRoles: [
      { id: 't1', name: 'Tech Lead', hourlyRate: 160, weeklyHours: 40, monthlyCost: 25600, isActive: true },
      { id: 't2', name: 'Senior Developer', hourlyRate: 120, weeklyHours: 40, monthlyCost: 19200, isActive: true },
      { id: 't3', name: 'QA Engineer', hourlyRate: 90, weeklyHours: 40, monthlyCost: 14400, isActive: true }
    ],
    suggestedServices: [
      { id: 's1', name: 'Web Development', defaultHourlyRate: 140, category: 'Development' },
      { id: 's2', name: 'Mobile App Dev', defaultHourlyRate: 150, category: 'Development' },
      { id: 's3', name: 'API Integration', defaultHourlyRate: 130, category: 'Development' }
    ],
    suggestedCompanyCosts: [
      { id: 'c1', name: 'AWS Infrastructure', amount: 500, type: 'variable', frequency: 'monthly' },
      { id: 'c2', name: 'GitHub Enterprise', amount: 200, type: 'fixed', frequency: 'monthly' }
    ]
  },
  {
    id: 'marketing',
    name: 'Digital Marketing',
    description: 'Social media, SEO, ads, content marketing',
    icon: 'Megaphone',
    color: 'bg-green-500',
    suggestedRoles: [
      { id: 't1', name: 'Marketing Manager', hourlyRate: 110, weeklyHours: 40, monthlyCost: 17600, isActive: true },
      { id: 't2', name: 'Content Creator', hourlyRate: 70, weeklyHours: 40, monthlyCost: 11200, isActive: true },
      { id: 't3', name: 'SEO Specialist', hourlyRate: 90, weeklyHours: 40, monthlyCost: 14400, isActive: true }
    ],
    suggestedServices: [
      { id: 's1', name: 'Social Media Mgmt', defaultHourlyRate: 90, category: 'Marketing' },
      { id: 's2', name: 'SEO Audit', defaultHourlyRate: 120, category: 'Marketing' },
      { id: 's3', name: 'PPC Campaign', defaultHourlyRate: 100, category: 'Marketing' }
    ],
    suggestedCompanyCosts: [
      { id: 'c1', name: 'SEMrush Subscription', amount: 400, type: 'fixed', frequency: 'monthly' },
      { id: 'c2', name: 'Ad Spend Buffer', amount: 5000, type: 'variable', frequency: 'monthly' }
    ]
  },
  {
    id: 'audiovisual',
    name: 'Audiovisual Production',
    description: 'Corporate video, post-production, motion graphics, animation',
    icon: 'Video',
    color: 'bg-red-500',
    suggestedRoles: [
      { id: 't1', name: 'Video Editor', hourlyRate: 80, weeklyHours: 40, monthlyCost: 12800, isActive: true },
      { id: 't2', name: 'Motion Designer', hourlyRate: 90, weeklyHours: 40, monthlyCost: 14400, isActive: true },
      { id: 't3', name: 'Producer', hourlyRate: 100, weeklyHours: 40, monthlyCost: 16000, isActive: true },
      { id: 't4', name: 'Sound Engineer', hourlyRate: 75, weeklyHours: 20, monthlyCost: 6000, isActive: true }
    ],
    suggestedServices: [
      { id: 's1', name: 'Corporate Video', defaultHourlyRate: 120, category: 'Production' },
      { id: 's2', name: 'Motion Graphics', defaultHourlyRate: 110, category: 'Post-Production' },
      { id: 's3', name: 'Video Editing', defaultHourlyRate: 90, category: 'Post-Production' },
      { id: 's4', name: 'Color Grading', defaultHourlyRate: 100, category: 'Post-Production' }
    ],
    suggestedCompanyCosts: [
      { id: 'c1', name: 'Adobe Creative Cloud', amount: 600, type: 'fixed', frequency: 'monthly' },
      { id: 'c2', name: 'Stock Footage Sub', amount: 200, type: 'fixed', frequency: 'monthly' },
      { id: 'c3', name: 'Equipment Insurance', amount: 150, type: 'fixed', frequency: 'monthly' }
    ]
  },
  {
    id: 'consulting',
    name: 'Software Consulting',
    description: 'Tech audit, architecture, strategic consulting',
    icon: 'Briefcase',
    color: 'bg-orange-500',
    suggestedRoles: [
      { id: 't1', name: 'Principal Consultant', hourlyRate: 250, weeklyHours: 40, monthlyCost: 40000, isActive: true },
      { id: 't2', name: 'Solutions Architect', hourlyRate: 200, weeklyHours: 40, monthlyCost: 32000, isActive: true },
      { id: 't3', name: 'Tech Lead', hourlyRate: 180, weeklyHours: 40, monthlyCost: 28800, isActive: true }
    ],
    suggestedServices: [
      { id: 's1', name: 'Tech Audit', defaultHourlyRate: 250, category: 'Consulting' },
      { id: 's2', name: 'Architecture Design', defaultHourlyRate: 220, category: 'Consulting' },
      { id: 's3', name: 'Strategic Planning', defaultHourlyRate: 200, category: 'Consulting' },
      { id: 's4', name: 'Code Review', defaultHourlyRate: 180, category: 'Consulting' }
    ],
    suggestedCompanyCosts: [
      { id: 'c1', name: 'Travel Expenses', amount: 3000, type: 'variable', frequency: 'monthly' },
      { id: 'c2', name: 'Research Tools', amount: 500, type: 'fixed', frequency: 'monthly' }
    ]
  }
];

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  logo?: string;
}

export const mockOrganizations: Organization[] = [
  { id: '1', name: 'AgenciaOps', slug: 'agenciaops', plan: 'professional' },
  { id: '2', name: 'Acme Creative', slug: 'acme-creative', plan: 'starter' },
  { id: '3', name: 'Tech Ventures', slug: 'tech-ventures', plan: 'enterprise' }
];
