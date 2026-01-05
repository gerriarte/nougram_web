"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
// #region agent log
fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projections/annual/page.tsx:14',message:'Import statement - checking what is imported',data:{imports:['useGetActiveAnnualProjection','useCreateAnnualProjection','useGetServices']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion
import {
  useGetActiveAnnualProjection,
  useCreateAnnualProjection,
  useGetServices,
} from '@/lib/queries';
// #region agent log
fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projections/annual/page.tsx:19',message:'After import - checking if useGetActiveAnnualProjection is a function',data:{isFunction:typeof useGetActiveAnnualProjection,value:useGetActiveAnnualProjection},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion
import { AnnualProjectionMatrix } from '@/components/projections/AnnualProjectionMatrix';
import { ProjectionCharts } from '@/components/projections/ProjectionCharts';
import { CapacityAlerts } from '@/components/projections/CapacityAlerts';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { useGetCurrentUser } from '@/lib/queries';
import { canViewFinancialProjections } from '@/lib/permissions';

export default function AnnualProjectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: currentUser } = useGetCurrentUser();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectionYear, setNewProjectionYear] = useState(currentYear);
  const [newProjectionNotes, setNewProjectionNotes] = useState('');

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projections/annual/page.tsx:37',message:'Before calling useGetActiveAnnualProjection',data:{selectedYear,isFunction:typeof useGetActiveAnnualProjection,value:useGetActiveAnnualProjection},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const { data: projection, isLoading, error, refetch } = useGetActiveAnnualProjection(selectedYear);
  const { data: servicesData } = useGetServices();
  const createMutation = useCreateAnnualProjection();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projections/annual/page.tsx:46',message:'Services data from API',data:{servicesData,isArray:Array.isArray(servicesData),hasItems:!!(servicesData as any)?.items,itemsIsArray:Array.isArray((servicesData as any)?.items),itemsLength:(servicesData as any)?.items?.length,firstService:(servicesData as any)?.items?.[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Handle services data structure (can be array or object with items)
  const servicesArray = servicesData 
    ? (Array.isArray(servicesData) 
        ? servicesData 
        : ((servicesData as any)?.items && Array.isArray((servicesData as any).items))
          ? (servicesData as any).items
          : [])
    : [];

  const services = servicesArray.filter((s: any) => s.is_active && !s.deleted_at);
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projections/annual/page.tsx:58',message:'Services after filtering',data:{servicesArrayLength:servicesArray.length,servicesLength:services.length,firstService:services[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const canView = currentUser ? canViewFinancialProjections(currentUser) : false;

  if (!canView) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para ver proyecciones financieras. Se requiere rol de owner o admin_financiero.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleCreateProjection = async () => {
    if (!services || services.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay servicios activos. Crea servicios antes de crear una proyección.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create projection with empty entries for all services and months
      const entries = [];
      for (const service of services) {
        for (let month = 1; month <= 12; month++) {
          entries.push({
            service_id: service.id,
            month,
            quantity: 0,
            hours_per_unit: 0,
          });
        }
      }

      await createMutation.mutateAsync({
        year: newProjectionYear,
        notes: newProjectionNotes || undefined,
        entries,
      });

      toast({
        title: 'Proyección creada',
        description: `Proyección para el año ${newProjectionYear} creada exitosamente.`,
      });

      setIsCreateDialogOpen(false);
      setNewProjectionNotes('');
      refetch();
    } catch (error) {
      toast({
        title: 'Error al crear proyección',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Handle 404 as "no projection exists" (not an error)
  const isNotFoundError = error instanceof Error && (
    error.message.includes('404') || 
    error.message.includes('No active projection') ||
    error.message.includes('No projection found') ||
    error.message.includes('no existe') ||
    error.message.includes('eliminado')
  );

  if (error && !isNotFoundError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar la proyección: {error instanceof Error ? error.message : 'Error desconocido'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!projection || isNotFoundError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-grey-900">Proyección de Ventas Anual</h1>
            <p className="text-grey-600 mt-1">
              Crea y gestiona proyecciones anuales de ingresos por servicio
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="year-select">Año:</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger id="year-select" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Proyección
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No hay proyección para {selectedYear}</h3>
                <p className="text-muted-foreground mt-1">
                  Crea una nueva proyección para comenzar a planificar tus ingresos anuales
                </p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Proyección para {selectedYear}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Proyección Anual</DialogTitle>
              <DialogDescription>
                Crea una nueva proyección de ventas para el año seleccionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2100"
                  value={newProjectionYear}
                  onChange={(e) => setNewProjectionYear(parseInt(e.target.value) || currentYear)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={newProjectionNotes}
                  onChange={(e) => setNewProjectionNotes(e.target.value)}
                  placeholder="Notas adicionales sobre esta proyección..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProjection} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Proyección
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-grey-900">Proyección de Ventas Anual</h1>
          <p className="text-grey-600 mt-1">
            Planifica tus ingresos anuales por servicio y mes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="year-select">Año:</Label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger id="year-select" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Anuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(projection.total_annual_revenue), 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(parseFloat(projection.total_annual_revenue) / 12, 'USD')} promedio mensual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Horas Anuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projection.total_annual_hours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(projection.total_annual_hours / 12).toFixed(1)}h promedio mensual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Break-Even Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(projection.break_even_monthly_cost), 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Costos fijos + nómina mensual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Alerts */}
      <CapacityAlerts
        summary={projection.summary}
        breakEvenMonthlyCost={projection.break_even_monthly_cost}
        totalAnnualHours={projection.total_annual_hours}
      />

      {/* Matrix */}
      <AnnualProjectionMatrix projection={projection} onUpdate={refetch} />

      {/* Charts */}
      <ProjectionCharts
        summary={projection.summary}
        breakEvenMonthlyCost={projection.break_even_monthly_cost}
        currency="USD"
      />
    </div>
  );
}
