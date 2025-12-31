"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Users, Package, DollarSign } from 'lucide-react';
import { useAISuggestions, OnboardingSuggestionResponse } from '@/lib/queries/ai';
import { useToast } from '@/hooks/use-toast';

interface AISuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industry: string;
  region: string;
  currency: string;
  customContext?: string;
  onApply: (suggestions: OnboardingSuggestionResponse) => void;
}

export function AISuggestionDialog({
  open,
  onOpenChange,
  industry,
  region,
  currency,
  customContext,
  onApply,
}: AISuggestionDialogProps) {
  const [selectedTab, setSelectedTab] = useState<'roles' | 'services' | 'costs'>('roles');
  const { toast } = useToast();
  const suggestionsMutation = useAISuggestions();

  const handleGenerate = async () => {
    try {
      const result = await suggestionsMutation.mutateAsync({
        industry,
        region,
        currency,
        custom_context: customContext,
      });

      toast({
        title: 'Sugerencias generadas',
        description: 'Revisa las sugerencias y selecciona las que deseas aplicar.',
      });
    } catch (error) {
      toast({
        title: 'Error al generar sugerencias',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    }
  };

  const handleApply = () => {
    if (suggestionsMutation.data) {
      onApply(suggestionsMutation.data);
      onOpenChange(false);
      toast({
        title: 'Sugerencias aplicadas',
        description: 'Las sugerencias seleccionadas se han aplicado a tu configuración.',
      });
    }
  };

  const suggestions = suggestionsMutation.data;
  const hasSuggestions = suggestions && (
    suggestions.suggested_roles.length > 0 ||
    suggestions.suggested_services.length > 0 ||
    suggestions.suggested_fixed_costs.length > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sugerencias de IA para {industry}
          </DialogTitle>
          <DialogDescription>
            La IA ha generado sugerencias personalizadas basadas en tu industria y región. Revisa y selecciona las que deseas aplicar.
          </DialogDescription>
        </DialogHeader>

        {!suggestionsMutation.isPending && !hasSuggestions && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Haz clic en "Generar Sugerencias" para obtener recomendaciones personalizadas.
            </p>
          </div>
        )}

        {suggestionsMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generando sugerencias personalizadas...</p>
          </div>
        )}

        {hasSuggestions && (
          <div className="space-y-4">
            {/* Confidence Scores */}
            {suggestions.confidence_scores && (
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-grey-700">Confianza en Roles</p>
                  <Badge variant="outline" className="mt-1">
                    {((suggestions.confidence_scores.roles || 0) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-grey-700">Confianza en Servicios</p>
                  <Badge variant="outline" className="mt-1">
                    {((suggestions.confidence_scores.services || 0) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-grey-700">Confianza en Costos</p>
                  <Badge variant="outline" className="mt-1">
                    {((suggestions.confidence_scores.costs || 0) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            )}

            {/* Reasoning */}
            {suggestions.reasoning && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Razonamiento de la IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{suggestions.reasoning}</p>
                </CardContent>
              </Card>
            )}

            {/* Tabs for different suggestion types */}
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Roles ({suggestions.suggested_roles.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Servicios ({suggestions.suggested_services.length})
                </TabsTrigger>
                <TabsTrigger value="costs" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Costos ({suggestions.suggested_fixed_costs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="roles" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Roles Sugeridos</CardTitle>
                    <CardDescription>
                      Miembros del equipo típicos para {industry} en {region}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Salario Mensual</TableHead>
                          <TableHead>Horas Facturables</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suggestions.suggested_roles.map((role, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.role}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: role.currency,
                              }).format(role.salary_monthly_brute)}
                            </TableCell>
                            <TableCell>{role.billable_hours_per_week} hrs/semana</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Servicios Sugeridos</CardTitle>
                    <CardDescription>
                      Servicios comunes ofrecidos en {industry}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Margen Objetivo</TableHead>
                          <TableHead>Tipo de Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suggestions.suggested_services.map((service, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {service.description || 'Sin descripción'}
                            </TableCell>
                            <TableCell>
                              {(service.default_margin_target * 100).toFixed(0)}%
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{service.pricing_type}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="costs" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Costos Fijos Sugeridos</CardTitle>
                    <CardDescription>
                      Costos fijos típicos para {industry}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Costo Mensual</TableHead>
                          <TableHead>Descripción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suggestions.suggested_fixed_costs.map((cost, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{cost.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{cost.category}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: cost.currency,
                              }).format(cost.amount_monthly)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {cost.description || 'Sin descripción'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={suggestionsMutation.isPending}
          >
            Cancelar
          </Button>
          {!hasSuggestions && (
            <Button
              onClick={handleGenerate}
              disabled={suggestionsMutation.isPending}
              className="bg-primary-500 hover:bg-primary-700"
            >
              {suggestionsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Sugerencias
                </>
              )}
            </Button>
          )}
          {hasSuggestions && (
            <Button
              onClick={handleApply}
              className="bg-primary-500 hover:bg-primary-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aplicar Sugerencias
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




