"use client";

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, Save, AlertCircle } from 'lucide-react';
import { useGetServices } from '@/lib/queries';
import { useBulkUpdateProjectionEntries, useReplicateMonth } from '@/lib/queries';
import { EditableProjectionCell } from './EditableProjectionCell';
import { useToast } from '@/hooks/use-toast';
import type { AnnualSalesProjection, AnnualSalesProjectionEntry } from '@/lib/types/annual-projection';

interface AnnualProjectionMatrixProps {
  projection: AnnualSalesProjection;
  onUpdate?: () => void;
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const FULL_MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function AnnualProjectionMatrix({ projection, onUpdate }: AnnualProjectionMatrixProps) {
  const { data: servicesData, isLoading: servicesLoading } = useGetServices();
  const bulkUpdateMutation = useBulkUpdateProjectionEntries();
  const replicateMutation = useReplicateMonth();
  const { toast } = useToast();

  const [localEntries, setLocalEntries] = useState<Map<string, { quantity: number; hours_per_unit: number }>>(
    new Map(
      projection.entries.map(entry => [
        `${entry.service_id}-${entry.month}`,
        { quantity: entry.quantity, hours_per_unit: entry.hours_per_unit }
      ])
    )
  );

  const [hasChanges, setHasChanges] = useState(false);
  const [replicateSourceMonth, setReplicateSourceMonth] = useState<number | null>(null);

  const services = useMemo(() => {
    if (!servicesData || !Array.isArray(servicesData)) return [];
    return (servicesData as any[]).filter((s: any) => s.is_active && !s.deleted_at);
  }, [servicesData]);

  const getEntry = useCallback((serviceId: number, month: number) => {
    const key = `${serviceId}-${month}`;
    return localEntries.get(key) || { quantity: 0, hours_per_unit: 0 };
  }, [localEntries]);

  const handleCellUpdate = useCallback((serviceId: number, month: number, quantity: number, hoursPerUnit: number) => {
    const key = `${serviceId}-${month}`;
    const current = localEntries.get(key);
    
    if (!current || current.quantity !== quantity || current.hours_per_unit !== hoursPerUnit) {
      setLocalEntries(prev => {
        const next = new Map(prev);
        next.set(key, { quantity, hours_per_unit: hoursPerUnit });
        return next;
      });
      setHasChanges(true);
    }
  }, [localEntries]);

  const handleSave = async () => {
    try {
      const entriesToUpdate = Array.from(localEntries.entries()).map(([key, value]) => {
        const [serviceId, month] = key.split('-').map(Number);
        return {
          service_id: serviceId,
          month,
          quantity: value.quantity,
          hours_per_unit: value.hours_per_unit,
        };
      });

      await bulkUpdateMutation.mutateAsync({
        projectionId: projection.id,
        data: { entries: entriesToUpdate },
      });

      setHasChanges(false);
      toast({
        title: 'Proyección actualizada',
        description: 'Los cambios se han guardado exitosamente.',
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    }
  };

  const handleReplicate = async () => {
    if (!replicateSourceMonth) {
      toast({
        title: 'Error',
        description: 'Selecciona un mes para replicar',
        variant: 'destructive',
      });
      return;
    }

    try {
      await replicateMutation.mutateAsync({
        projectionId: projection.id,
        data: {
          source_month: replicateSourceMonth,
          target_months: undefined, // Replicar a todos los meses
        },
      });

      toast({
        title: 'Mes replicado',
        description: `Los valores de ${FULL_MONTH_NAMES[replicateSourceMonth - 1]} se han replicado a todos los meses.`,
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error al replicar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    }
  };

  const calculateServiceTotal = (serviceId: number) => {
    let totalHours = 0;
    for (let month = 1; month <= 12; month++) {
      const entry = getEntry(serviceId, month);
      totalHours += entry.quantity * entry.hours_per_unit;
    }
    return totalHours;
  };

  const calculateMonthTotal = (month: number) => {
    let totalHours = 0;
    services.forEach(service => {
      const entry = getEntry(service.id, month);
      totalHours += entry.quantity * entry.hours_per_unit;
    });
    return totalHours;
  };

  if (servicesLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay servicios activos. Crea servicios antes de crear una proyección.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Matriz de Proyección - {projection.year}</CardTitle>
            <CardDescription>
              Edita la cantidad y horas por unidad para cada servicio y mes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="replicate-month" className="text-sm">Replicar mes:</Label>
              <Select
                value={replicateSourceMonth?.toString() || ''}
                onValueChange={(value) => setReplicateSourceMonth(parseInt(value))}
              >
                <SelectTrigger id="replicate-month" className="w-32">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {FULL_MONTH_NAMES.map((name, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplicate}
                disabled={!replicateSourceMonth || replicateMutation.isPending}
              >
                <Copy className="mr-2 h-4 w-4" />
                Replicar
              </Button>
            </div>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={bulkUpdateMutation.isPending}
              >
                {bulkUpdateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">Servicio</TableHead>
                {MONTH_NAMES.map((month, index) => (
                  <TableHead key={index + 1} className="text-center min-w-[140px]">
                    {month}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[100px]">Total Anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service: any) => {
                const serviceTotal = calculateServiceTotal(service.id);
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium sticky left-0 bg-white z-10">
                      {service.name}
                    </TableCell>
                    {MONTH_NAMES.map((_, index) => {
                      const month = index + 1;
                      const entry = getEntry(service.id, month);
                      return (
                        <TableCell key={month} className="text-center">
                          <EditableProjectionCell
                            quantity={entry.quantity}
                            hoursPerUnit={entry.hours_per_unit}
                            onSave={(qty, hrs) => handleCellUpdate(service.id, month, qty, hrs)}
                            serviceName={service.name}
                            serviceMargin={service.default_margin_target}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-semibold">
                      {serviceTotal > 0 ? `${serviceTotal.toFixed(1)}h` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-semibold bg-grey-50">
                <TableCell className="sticky left-0 bg-grey-50 z-10">Total Mensual</TableCell>
                {MONTH_NAMES.map((_, index) => {
                  const month = index + 1;
                  const monthTotal = calculateMonthTotal(month);
                  return (
                    <TableCell key={month} className="text-center">
                      {monthTotal > 0 ? `${monthTotal.toFixed(1)}h` : '-'}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  {Array.from({ length: 12 }, (_, i) => calculateMonthTotal(i + 1))
                    .reduce((sum, val) => sum + val, 0)
                    .toFixed(1)}h
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
