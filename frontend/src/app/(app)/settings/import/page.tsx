"use client";

import { useState } from "react";
import { DocumentParser } from "@/components/ai/DocumentParser";
import { AIChatbot } from "@/components/ai/AIChatbot";
import { useCreateTeamMember, useCreateFixedCost, useCreateService } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, FileText, MessageSquare } from "lucide-react";
import type { DocumentParseResponse, NaturalLanguageCommandResponse } from "@/lib/queries/ai";

export default function ImportSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createTeamMemberMutation = useCreateTeamMember();
  const createFixedCostMutation = useCreateFixedCost();
  const createServiceMutation = useCreateService();
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (data: DocumentParseResponse) => {
    setIsApplying(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Apply team members
      for (const member of data.team_members) {
        try {
          await createTeamMemberMutation.mutateAsync({
            name: member.name,
            role: member.role,
            salary_monthly_brute: parseFloat(member.salary_monthly_brute),
            currency: member.currency,
            billable_hours_per_week: member.billable_hours_per_week,
            is_active: member.is_active ?? true,
          });
          successCount++;
        } catch (error) {
          console.error(`Error creating team member ${member.name}:`, error);
          errorCount++;
        }
      }

      // Apply fixed costs
      for (const cost of data.fixed_costs) {
        try {
          await createFixedCostMutation.mutateAsync({
            name: cost.name,
            amount_monthly: parseFloat(cost.amount_monthly),
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
          });
          successCount++;
        } catch (error) {
          console.error(`Error creating fixed cost ${cost.name}:`, error);
          errorCount++;
        }
      }

      // Note: Subscriptions are not yet implemented as a separate model
      // They could be added as fixed costs with category "Subscription"

      toast({
        title: "Datos aplicados",
        description: `${successCount} elementos creados exitosamente${errorCount > 0 ? `. ${errorCount} errores.` : '.'}`,
        variant: errorCount > 0 ? "default" : "default",
      });

      // Redirect to relevant pages
      if (data.team_members.length > 0) {
        router.push("/settings/team");
      } else if (data.fixed_costs.length > 0) {
        router.push("/settings/costs");
      }
    } catch (error) {
      toast({
        title: "Error al aplicar datos",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-grey-900">Importación Inteligente</h1>
        <p className="text-grey-600 mt-1">
          Extrae automáticamente datos de documentos usando IA
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Todos los datos extraídos requieren revisión humana antes de guardarse.
          La IA puede cometer errores, especialmente con formatos complejos o datos ambiguos.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="document" className="space-y-4">
        <TabsList>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Parsear Documento
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat de Comandos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="space-y-4">
          <DocumentParser onApply={handleApply} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <AIChatbot onActionConfirm={handleCommandAction} />
        </TabsContent>
      </Tabs>
    </div>
  );

  async function handleCommandAction(action: NaturalLanguageCommandResponse) {
    setIsApplying(true);
    
    try {
      const { action_type, action_data } = action;

      switch (action_type) {
        case 'add_team_member':
          if (action_data.name && action_data.role && action_data.salary_monthly_brute) {
            await createTeamMemberMutation.mutateAsync({
              name: action_data.name,
              role: action_data.role,
              salary_monthly_brute: action_data.salary_monthly_brute,
              currency: action_data.currency || 'USD',
              billable_hours_per_week: action_data.billable_hours_per_week || 32,
              is_active: true,
            });
            toast({
              title: "Miembro del equipo creado",
              description: `${action_data.name} ha sido agregado exitosamente.`,
            });
            router.push("/settings/team");
          }
          break;

        case 'add_service':
          if (action_data.service_name && action_data.default_margin_target !== undefined) {
            await createServiceMutation.mutateAsync({
              name: action_data.service_name,
              description: action_data.description,
              default_margin_target: action_data.default_margin_target,
              pricing_type: action_data.pricing_type || 'hourly',
              is_active: true,
            });
            toast({
              title: "Servicio creado",
              description: `${action_data.service_name} ha sido agregado exitosamente.`,
            });
            router.push("/settings/services");
          }
          break;

        case 'add_fixed_cost':
          if (action_data.cost_name && action_data.amount_monthly && action_data.category) {
            await createFixedCostMutation.mutateAsync({
              name: action_data.cost_name,
              amount_monthly: action_data.amount_monthly,
              currency: action_data.currency || 'USD',
              category: action_data.category,
            });
            toast({
              title: "Costo fijo creado",
              description: `${action_data.cost_name} ha sido agregado exitosamente.`,
            });
            router.push("/settings/costs");
          }
          break;

        default:
          toast({
            title: "Acción no soportada",
            description: `La acción "${action_type}" aún no está implementada.`,
            variant: "destructive",
          });
      }
    } catch (error) {
      toast({
        title: "Error al ejecutar acción",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  }
}
