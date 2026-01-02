"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useOnboardingStore, TeamMember } from '@/stores/onboarding-store';
import { formatCurrencyForInput, parseCurrencyFromInput } from '@/lib/currency-mask';
import { formatCurrency } from '@/lib/currency';
import { CURRENCIES } from '@/lib/currency';
// ESTÁNDAR NOUGRAM: Usar dinero.js para cálculos precisos
import { fromAPI, sumMoney, toAPI } from '@/lib/money';
import type { Dinero } from 'dinero.js';

const teamMemberSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  role: z.string().min(1, "El rol es requerido"),
  salary: z.number().min(0, "El salario debe ser positivo"),
  billableHours: z.number().min(1).max(80, "Las horas deben estar entre 1 y 80"),
  currency: z.string(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface TeamMembersTableProps {
  defaultCurrency: string;
}

export function TeamMembersTable({ defaultCurrency }: TeamMembersTableProps) {
  const { teamMembers, addTeamMember, removeTeamMember, updateTeamMember } = useOnboardingStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      role: '',
      salary: 0,
      billableHours: 40,
      currency: defaultCurrency,
    },
  });

  const selectedCurrency = watch('currency') || defaultCurrency;

  const handleAddMember = () => {
    setIsFormOpen(true);
    setEditingIndex(null);
    reset({
      name: '',
      role: '',
      salary: 0,
      billableHours: 40,
      currency: defaultCurrency,
    });
    setSalaryInput('');
  };

  const handleEditMember = (index: number) => {
    const member = teamMembers[index];
    setEditingIndex(index);
    setIsFormOpen(true);
    setValue('name', member.name);
    setValue('role', member.role);
    setValue('salary', member.salary);
    setValue('billableHours', member.billableHours);
    setValue('currency', member.currency || defaultCurrency);
    setSalaryInput(formatCurrencyForInput(member.salary, member.currency || defaultCurrency));
  };

  const onSubmit = (data: TeamMemberFormData) => {
    const member: TeamMember = {
      name: data.name,
      role: data.role,
      salary: data.salary,
      billableHours: data.billableHours,
      currency: data.currency,
    };

    if (editingIndex !== null) {
      updateTeamMember(editingIndex, member);
    } else {
      addTeamMember(member);
    }

    setIsFormOpen(false);
    setEditingIndex(null);
    reset();
    setSalaryInput('');
  };

  const handleSalaryChange = (value: string, currency: string) => {
    setSalaryInput(value);
    const parsed = parseCurrencyFromInput(value, currency);
    setValue('salary', parsed);
  };

  // ESTÁNDAR NOUGRAM: Calcular total usando dinero.js para precisión
  const totalMonthlySalaries = (() => {
    // Convertir salarios a Dinero (solo los que están en la moneda base)
    const salariesInBaseCurrency: Dinero[] = teamMembers
      .filter(member => (member.currency || defaultCurrency) === defaultCurrency)
      .map(member => fromAPI(member.salary, defaultCurrency));
    
    // Si hay miembros con otras monedas, mostrar warning en consola
    const membersWithOtherCurrency = teamMembers.filter(
      member => (member.currency || defaultCurrency) !== defaultCurrency
    );
    if (membersWithOtherCurrency.length > 0) {
      console.warn(
        `TeamMembersTable: ${membersWithOtherCurrency.length} miembros tienen moneda diferente a ${defaultCurrency}. ` +
        `Solo se suman los salarios en ${defaultCurrency}.`
      );
    }
    
    // Sumar usando dinero.js
    const totalMoney = sumMoney(salariesInBaseCurrency);
    return totalMoney ? toAPI(totalMoney) : 0;
  })();

  const totalBillableHours = teamMembers.reduce((sum, member) => {
    return sum + (member.billableHours * 4.33); // 4.33 semanas por mes
  }, 0);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-grey-900">Miembros del Equipo</CardTitle>
            <CardDescription className="text-grey-600">
              Agrega los miembros de tu equipo con sus salarios y horas facturables
            </CardDescription>
          </div>
          <Button onClick={handleAddMember} className="bg-primary-500 hover:bg-primary-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Miembro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <Card className="mb-6 border-primary-200 bg-primary-50">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingIndex !== null ? 'Editar Miembro' : 'Nuevo Miembro'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Ej: Juan Pérez"
                      className="h-10 bg-white"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Input
                      id="role"
                      {...register('role')}
                      placeholder="Ej: Diseñador Senior"
                      className="h-10 bg-white"
                    />
                    {errors.role && (
                      <p className="text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salario Mensual</Label>
                    <Input
                      id="salary"
                      type="text"
                      value={salaryInput}
                      onChange={(e) => handleSalaryChange(e.target.value, selectedCurrency)}
                      placeholder="Ej: 5.000.000"
                      className="h-10 bg-white"
                    />
                    {errors.salary && (
                      <p className="text-sm text-red-600">{errors.salary.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={selectedCurrency}
                      onValueChange={(value) => {
                        setValue('currency', value);
                        // Re-formatear el input con la nueva moneda
                        const currentSalary = watch('salary');
                        if (currentSalary > 0) {
                          setSalaryInput(formatCurrencyForInput(currentSalary, value));
                        }
                      }}
                    >
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billableHours">Horas Facturables/Semana</Label>
                    <Input
                      id="billableHours"
                      type="number"
                      min={1}
                      max={80}
                      {...register('billableHours', { valueAsNumber: true })}
                      className="h-10 bg-white"
                    />
                    {errors.billableHours && (
                      <p className="text-sm text-red-600">{errors.billableHours.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingIndex(null);
                      reset();
                      setSalaryInput('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white">
                    {editingIndex !== null ? 'Guardar Cambios' : 'Agregar Miembro'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {teamMembers.length === 0 ? (
          <div className="text-center py-12 text-grey-600">
            <p>No hay miembros del equipo agregados aún.</p>
            <p className="text-sm mt-2">Haz clic en "Agregar Miembro" para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-grey-50">
                  <TableHead className="text-grey-700 font-semibold">Nombre</TableHead>
                  <TableHead className="text-grey-700 font-semibold">Rol</TableHead>
                  <TableHead className="text-grey-700 font-semibold">Salario Mensual</TableHead>
                  <TableHead className="text-grey-700 font-semibold">Horas/Semana</TableHead>
                  <TableHead className="text-grey-700 font-semibold">Horas/Mes</TableHead>
                  <TableHead className="text-grey-700 font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      {formatCurrency(member.salary, member.currency || defaultCurrency)}
                    </TableCell>
                    <TableCell>{member.billableHours}h</TableCell>
                    <TableCell>{(member.billableHours * 4.33).toFixed(1)}h</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMember(index)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(index)}
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold bg-grey-50">
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell>
                    {formatCurrency(totalMonthlySalaries, defaultCurrency)}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell>{totalBillableHours.toFixed(1)}h</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}






