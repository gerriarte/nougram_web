"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, AlertCircle, CheckCircle2, Users, DollarSign, CreditCard } from 'lucide-react';
import { useParseDocument, DocumentParseResponse, ParsedTeamMember, ParsedFixedCost, ParsedSubscription } from '@/lib/queries/ai';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';

interface DocumentParserProps {
  onApply?: (data: DocumentParseResponse) => void;
}

export function DocumentParser({ onApply }: DocumentParserProps) {
  const [text, setText] = useState('');
  const [documentType, setDocumentType] = useState<'payroll' | 'expenses' | 'mixed' | undefined>(undefined);
  const { toast } = useToast();
  const parseMutation = useParseDocument();

  const handleParse = async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa el contenido del documento',
        variant: 'destructive',
      });
      return;
    }

    try {
      await parseMutation.mutateAsync({
        text: text.trim(),
        document_type: documentType,
      });

      toast({
        title: 'Documento parseado',
        description: 'Revisa los datos extraídos antes de aplicar.',
      });
    } catch (error) {
      toast({
        title: 'Error al parsear documento',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    }
  };

  const handleApply = () => {
    if (parseMutation.data && onApply) {
      onApply(parseMutation.data);
      toast({
        title: 'Datos aplicados',
        description: 'Los datos extraídos se han aplicado. Revisa y guarda los cambios.',
      });
    }
  };

  const parsedData = parseMutation.data;
  const hasData = parsedData && (
    parsedData.team_members.length > 0 ||
    parsedData.fixed_costs.length > 0 ||
    parsedData.subscriptions.length > 0
  );

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-grey-200';
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Importación Inteligente de Documentos
          </CardTitle>
          <CardDescription>
            Pega el contenido de documentos (PDF, CSV, Excel) y la IA extraerá automáticamente
            miembros del equipo, costos fijos y suscripciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Tipo de Documento (Opcional)</Label>
            <Select value={documentType || ''} onValueChange={(value) => setDocumentType(value as any || undefined)}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Selecciona el tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No especificar</SelectItem>
                <SelectItem value="payroll">Nómina</SelectItem>
                <SelectItem value="expenses">Gastos</SelectItem>
                <SelectItem value="mixed">Mixto</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Especificar el tipo ayuda a la IA a clasificar mejor los datos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-text">Contenido del Documento</Label>
            <Textarea
              id="document-text"
              placeholder="Pega aquí el contenido del documento (texto copiado de PDF, CSV, Excel, etc.)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              {text.length} caracteres (máximo 10,000)
            </p>
          </div>

          <Button
            onClick={handleParse}
            disabled={parseMutation.isPending || !text.trim()}
            className="w-full"
          >
            {parseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parseando documento...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Parsear Documento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Datos Extraídos</CardTitle>
              {onApply && (
                <Button onClick={handleApply} variant="default">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aplicar Datos
                </Button>
              )}
            </div>
            <CardDescription>
              Revisa los datos extraídos antes de aplicar. Todos los datos requieren confirmación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <Tabs defaultValue="team" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="team" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Equipo ({parsedData.team_members.length})
                    {parsedData.confidence_scores.team_members && (
                      <Badge className={getConfidenceColor(parsedData.confidence_scores.team_members)}>
                        {(parsedData.confidence_scores.team_members * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="costs" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Costos ({parsedData.fixed_costs.length})
                    {parsedData.confidence_scores.fixed_costs && (
                      <Badge className={getConfidenceColor(parsedData.confidence_scores.fixed_costs)}>
                        {(parsedData.confidence_scores.fixed_costs * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Suscripciones ({parsedData.subscriptions.length})
                    {parsedData.confidence_scores.subscriptions && (
                      <Badge className={getConfidenceColor(parsedData.confidence_scores.subscriptions)}>
                        {(parsedData.confidence_scores.subscriptions * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="space-y-4">
                  {parsedData.team_members.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Salario Mensual</TableHead>
                          <TableHead>Moneda</TableHead>
                          <TableHead>Horas/Semana</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.team_members.map((member: ParsedTeamMember, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>
                              {formatCurrency(parseFloat(member.salary_monthly_brute), member.currency)}
                            </TableCell>
                            <TableCell>{member.currency}</TableCell>
                            <TableCell>{member.billable_hours_per_week}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No se encontraron miembros del equipo en el documento
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="costs" className="space-y-4">
                  {parsedData.fixed_costs.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Monto Mensual</TableHead>
                          <TableHead>Moneda</TableHead>
                          <TableHead>Descripción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.fixed_costs.map((cost: ParsedFixedCost, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{cost.name}</TableCell>
                            <TableCell>{cost.category}</TableCell>
                            <TableCell>
                              {formatCurrency(parseFloat(cost.amount_monthly), cost.currency)}
                            </TableCell>
                            <TableCell>{cost.currency}</TableCell>
                            <TableCell>{cost.description || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No se encontraron costos fijos en el documento
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="subscriptions" className="space-y-4">
                  {parsedData.subscriptions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Monto Mensual</TableHead>
                          <TableHead>Moneda</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.subscriptions.map((sub: ParsedSubscription, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{sub.name}</TableCell>
                            <TableCell>
                              {formatCurrency(sub.amount_monthly, sub.currency)}
                            </TableCell>
                            <TableCell>{sub.currency}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No se encontraron suscripciones en el documento
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No se pudieron extraer datos del documento. Intenta con un formato diferente o más información.
                </AlertDescription>
              </Alert>
            )}

            {parsedData.warnings && parsedData.warnings.length > 0 && (
              <Alert variant="default" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Advertencias:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {parsedData.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
