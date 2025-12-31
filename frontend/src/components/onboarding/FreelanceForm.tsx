"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { formatCurrencyForInput, parseCurrencyFromInput } from '@/lib/currency-mask';
import { useState, useEffect } from 'react';

const freelanceSchema = z.object({
  monthlyIncomeTarget: z.number().min(0, "El ingreso debe ser positivo"),
  vacationDays: z.number().min(0).max(30, "Máximo 30 días de vacaciones"),
});

type FreelanceFormData = z.infer<typeof freelanceSchema>;

interface FreelanceFormProps {
  currency: string;
}

export function FreelanceForm({ currency }: FreelanceFormProps) {
  const { monthlyIncomeTarget, vacationDays, setMonthlyIncomeTarget, setVacationDays } = useOnboardingStore();
  const [incomeInput, setIncomeInput] = useState(
    monthlyIncomeTarget ? formatCurrencyForInput(monthlyIncomeTarget, currency) : ''
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FreelanceFormData>({
    resolver: zodResolver(freelanceSchema),
    defaultValues: {
      monthlyIncomeTarget: monthlyIncomeTarget || 0,
      vacationDays: vacationDays || 10,
    },
  });

  const vacationDaysValue = watch('vacationDays');

  useEffect(() => {
    if (monthlyIncomeTarget) {
      setValue('monthlyIncomeTarget', monthlyIncomeTarget);
      setIncomeInput(formatCurrencyForInput(monthlyIncomeTarget, currency));
    }
    if (vacationDays) {
      setValue('vacationDays', vacationDays);
    }
  }, [monthlyIncomeTarget, vacationDays, currency, setValue]);

  const handleIncomeChange = (value: string) => {
    setIncomeInput(value);
    const parsed = parseCurrencyFromInput(value, currency);
    setValue('monthlyIncomeTarget', parsed);
    setMonthlyIncomeTarget(parsed);
  };

  const handleVacationDaysChange = (value: number[]) => {
    const days = value[0];
    setValue('vacationDays', days);
    setVacationDays(days);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-grey-900">Configuración Freelance</CardTitle>
        <CardDescription className="text-grey-600">
          Define tus objetivos de ingreso y tiempo disponible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncomeTarget" className="text-grey-700 font-medium">
              Ingreso Mensual Objetivo
            </Label>
            <Input
              id="monthlyIncomeTarget"
              type="text"
              value={incomeInput}
              onChange={(e) => handleIncomeChange(e.target.value)}
              placeholder="Ej: 5.000.000"
              className="h-10 bg-white border-grey-300"
            />
            {errors.monthlyIncomeTarget && (
              <p className="text-sm text-red-600">{errors.monthlyIncomeTarget.message}</p>
            )}
            <p className="text-xs text-grey-600">
              Este será tu objetivo de ingresos mensuales para calcular márgenes y precios
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="vacationDays" className="text-grey-700 font-medium">
                Días de Vacaciones al Año
              </Label>
              <span className="text-lg font-semibold text-primary-600">
                {vacationDaysValue} días
              </span>
            </div>
            <Slider
              id="vacationDays"
              min={0}
              max={30}
              step={1}
              value={[vacationDaysValue || 10]}
              onValueChange={handleVacationDaysChange}
              className="w-full"
            />
            <p className="text-xs text-grey-600">
              Los días de vacaciones se considerarán al calcular las horas facturables disponibles
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}






