"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, User, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileType = 'freelance' | 'professional' | 'company';

interface ProfileOption {
  type: ProfileType;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const profileOptions: ProfileOption[] = [
  {
    type: 'freelance',
    title: 'Freelance',
    description: 'Trabajas de forma independiente, gestionas tus propios ingresos y tiempos',
    icon: <User className="w-8 h-8" />,
    features: [
      'Ingreso mensual objetivo',
      'Días de vacaciones',
      'Estructura simplificada',
    ],
  },
  {
    type: 'professional',
    title: 'Profesional Independiente',
    description: 'Eres un profesional que ofrece servicios especializados',
    icon: <Briefcase className="w-8 h-8" />,
    features: [
      'Servicios especializados',
      'Estructura profesional',
      'Gestión de proyectos',
    ],
  },
  {
    type: 'company',
    title: 'Empresa',
    description: 'Tienes un equipo de trabajo y gestionas múltiples recursos',
    icon: <Building2 className="w-8 h-8" />,
    features: [
      'Gestión de equipo',
      'Múltiples roles',
      'Estructura completa de costos',
    ],
  },
];

interface ProfileSelectionProps {
  selectedProfile: ProfileType | null;
  onSelectProfile: (profile: ProfileType) => void;
}

export function ProfileSelection({ selectedProfile, onSelectProfile }: ProfileSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-grey-900 mb-2">Selecciona tu Perfil</h2>
        <p className="text-grey-600">
          Elige el perfil que mejor describe tu situación para personalizar la configuración
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profileOptions.map((option) => (
          <Card
            key={option.type}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg border-2",
              selectedProfile === option.type
                ? "border-primary-500 bg-primary-50"
                : "border-grey-200 hover:border-primary-300"
            )}
            onClick={() => onSelectProfile(option.type)}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "p-3 rounded-lg",
                  selectedProfile === option.type
                    ? "bg-primary-500 text-white"
                    : "bg-grey-100 text-grey-600"
                )}>
                  {option.icon}
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-grey-600">
                    <Check className="w-4 h-4 text-primary-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

