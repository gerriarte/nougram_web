"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Palette, Code, Megaphone, Briefcase, Video, ChevronRight, ArrowLeft, Loader2, Users, Package, DollarSign, Info, Sparkles } from 'lucide-react';
import { useGetTemplates, useApplyTemplate, useGetCurrentUser, useUpdateOrganization, useUpdateCurrencySettings } from '@/lib/queries';
import { IndustryTemplate } from '@/lib/types/templates';
import { TemplateCard } from '@/components/onboarding/TemplateCard';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { ProfileSelection } from '@/components/onboarding/ProfileSelection';
import { FreelanceForm } from '@/components/onboarding/FreelanceForm';
import { TeamMembersTable } from '@/components/onboarding/TeamMembersTable';
import { TaxStructureForm } from '@/components/onboarding/TaxStructureForm';
import { LiveSummarySidebar } from '@/components/onboarding/LiveSummarySidebar';
import { SalesProjection } from '@/components/onboarding/SalesProjection';
import { AISuggestionDialog } from '@/components/onboarding/AISuggestionDialog';
import { OnboardingSuggestionResponse } from '@/lib/queries/ai';
// Toast notifications - using simple alert for now, can be replaced with toast library
const toast = {
  success: (message: string) => alert(message),
  error: (message: string) => alert(message),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<IndustryTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [industry, setIndustry] = useState('');

  // Zustand store para persistir datos del onboarding
  const {
    organizationName,
    organizationDescription,
    country,
    currency,
    enableSocialCharges,
    setOrganizationName,
    setOrganizationDescription,
    setCountry,
    setCurrency,
    setEnableSocialCharges,
    taxes,
    teamMembers,
    profileType,
    monthlyIncomeTarget,
    vacationDays,
  } = useOnboardingStore();

  // Inicializar región desde store o default
  const region = country || 'US';

  const { data: templatesData, isLoading: templatesLoading } = useGetTemplates(true);
  // Extract templates array from response
  const templates = templatesData?.items || [];
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUser();
  const applyTemplate = useApplyTemplate();
  const updateOrganization = useUpdateOrganization();
  const updateCurrencySettings = useUpdateCurrencySettings();

  // Only owners can access onboarding
  useEffect(() => {
    if (!userLoading && currentUser) {
      if (currentUser.role !== 'owner') {
        // Non-owners should be redirected to dashboard
        router.push('/dashboard');
      }
      // Initialize organization details if not in store
      if (!organizationName && currentUser.organization_id) {
        // We can't easily get the org name here without fetching the org.
        // But the user might want to change it anyway. 
        // Typically the register flow sets a name.
        // We can rely on the user typing it or leave it empty if they want to change it.
      }
    }
  }, [currentUser, userLoading, router, organizationName]);

  // Show loading while checking user role
  if (userLoading || (currentUser && currentUser.role !== 'owner')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleTemplateSelect = (template: IndustryTemplate) => {
    setSelectedTemplate(template);
  };

  const handleViewDetails = (template: IndustryTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSelectFromModal = () => {
    if (previewTemplate) {
      handleTemplateSelect(previewTemplate);
      setIsPreviewOpen(false);
    }
  };

  const handleContinue = () => {
    // Validaciones antes de continuar
    if (step === 1) {
      // Validar que nombre, país y moneda estén seleccionados
      if (!organizationName) {
        toast.error('Por favor ingresa el nombre de la empresa');
        return;
      }
      if (!country || !currency) {
        toast.error('Por favor selecciona país y moneda');
        return;
      }
    }
    if (step === 4) {
      // El paso 4 (estructura tributaria) es opcional, no requiere validación estricta
      // Los valores por defecto se aplicarán si no se configuran
      setStep(5);
      return;
    }
    if (step === 2) {
      // Validar que se haya seleccionado un perfil
      const { profileType } = useOnboardingStore.getState();
      if (!profileType) {
        toast.error('Por favor selecciona un perfil');
        return;
      }
      // Validaciones específicas por perfil
      if (profileType === 'freelance') {
        const { monthlyIncomeTarget } = useOnboardingStore.getState();
        if (!monthlyIncomeTarget || monthlyIncomeTarget <= 0) {
          toast.error('Por favor ingresa un ingreso mensual objetivo');
          return;
        }
      }
      if (profileType === 'company') {
        const { teamMembers } = useOnboardingStore.getState();
        if (teamMembers.length === 0) {
          toast.error('Por favor agrega al menos un miembro del equipo');
          return;
        }
      }
    }
    if (step === 3 && selectedTemplate) {
      setStep(4); // Skip customization for now, go to tax structure
    } else {
      setStep(step + 1);
    }
  };

  const handleFinalize = async () => {
    if (!selectedTemplate || !currentUser?.organization_id) {
      toast.error('Missing template or organization information');
      return;
    }

    try {
      // 1. Update Organization Details
      await updateOrganization.mutateAsync({
        orgId: currentUser.organization_id,
        data: {
          name: organizationName,
          settings: {
            description: organizationDescription
          }
        }
      });
      
      // 1b. Update primary currency via currency settings endpoint
      // Esto asegura que la moneda se guarde como primary_currency y esté disponible en todos los formularios
      await updateCurrencySettings.mutateAsync({
        primary_currency: currency || 'USD'
      });

      // 2. Apply Template
      await applyTemplate.mutateAsync({
        organizationId: currentUser.organization_id,
        data: {
          industry_type: selectedTemplate.industry_type,
          region: country || region,
          currency: currency,
          customize: {
            roles: teamMembers.map(m => ({
              name: m.name,
              role: m.role,
              monthly_cost: m.salary,
              billable_hours_per_week: m.billableHours,
              currency: m.currency || currency
            })),
            taxes: taxes
          }
        },
      });
      toast.success('Workspace configured successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to configure workspace. Please try again.');
      console.error('Error applying template:', error);
    }
  };

  const handleApplyAISuggestions = (suggestions: OnboardingSuggestionResponse) => {
    // Apply AI suggestions to the onboarding store
    const store = useOnboardingStore.getState();

    // Apply team members
    if (suggestions.suggested_roles.length > 0) {
      const aiTeamMembers = suggestions.suggested_roles.map(role => ({
        name: role.name,
        role: role.role,
        salary: role.salary_monthly_brute,
        billableHours: role.billable_hours_per_week || 40,
        currency: role.currency,
      }));
      // Merge with existing team members (avoid duplicates)
      const existingNames = new Set(store.teamMembers.map(m => m.name));
      const newMembers = aiTeamMembers.filter(m => !existingNames.has(m.name));
      store.setTeamMembers([...store.teamMembers, ...newMembers]);
    }

    // Note: Services and fixed costs would need to be saved via API calls
    // For now, we'll just show a success message
    toast.success(`Se aplicaron ${suggestions.suggested_roles.length} roles sugeridos por IA`);

    // Optionally, move to step 2 to show the applied team members
    if (suggestions.suggested_roles.length > 0) {
      setStep(2);
    }
  };

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Palette': return <Palette className="w-12 h-12 text-white" />;
      case 'Code': return <Code className="w-12 h-12 text-white" />;
      case 'Megaphone': return <Megaphone className="w-12 h-12 text-white" />;
      case 'Briefcase': return <Briefcase className="w-12 h-12 text-white" />;
      case 'Video': return <Video className="w-12 h-12 text-white" />;
      default: return <Briefcase className="w-12 h-12 text-white" />;
    }
  };

  const rolesCount = selectedTemplate?.suggested_roles?.length || 0;
  const servicesCount = selectedTemplate?.suggested_services?.length || 0;
  const costsCount = selectedTemplate?.suggested_fixed_costs?.length || 0;

  return (
    <div className="min-h-screen bg-grey-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-grey-900">Welcome to Nougram</h1>
            <p className="text-grey-600 mt-1">Let's set up your organization workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-grey-700">Paso {step} de 6</span>
            <div className="w-32 h-2 bg-grey-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step 1: Localización */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-grey-900">Configuración de Localización</CardTitle>
              <CardDescription className="text-grey-600">
                Configura tu país y moneda para personalizar la estructura de costos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Organization Details */}
                  <div className="space-y-2">
                    <Label className="text-grey-700 font-medium">Nombre de la Empresa</Label>
                    <Input
                      placeholder="Ej: Agencia Creativa SAS"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="bg-white border-grey-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-grey-700 font-medium">Descripción</Label>
                    <Input
                      placeholder="Ej: Agencia de marketing digital enfocada en e-commerce..."
                      value={organizationDescription}
                      onChange={(e) => setOrganizationDescription(e.target.value)}
                      className="bg-white border-grey-300"
                    />
                    <p className="text-xs text-grey-600">
                      Una breve descripción de lo que hace tu empresa.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-grey-700 font-medium">Industria</Label>
                    <Input
                      placeholder="Ej: Marketing Digital, Desarrollo Web, Diseño Gráfico"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="bg-white border-grey-300"
                    />
                    <p className="text-xs text-grey-600">
                      Describe tu industria para obtener sugerencias personalizadas de IA
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-grey-700 font-medium">País / Región</Label>
                      <Select value={country || 'US'} onValueChange={(value) => {
                        setCountry(value);
                        // Si es Colombia, activar automáticamente cargas prestacionales
                        if (value === 'COL') {
                          setEnableSocialCharges(true);
                        }
                      }}>
                        <SelectTrigger className="h-10 bg-white border-grey-300">
                          <SelectValue placeholder="Selecciona tu país" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">Estados Unidos</SelectItem>
                          <SelectItem value="UK">Reino Unido</SelectItem>
                          <SelectItem value="COL">Colombia</SelectItem>
                          <SelectItem value="ARG">Argentina</SelectItem>
                          <SelectItem value="MEX">México</SelectItem>
                          <SelectItem value="ESP">España</SelectItem>
                          <SelectItem value="BR">Brasil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-grey-700 font-medium">Moneda Principal</Label>
                      <Select value={currency || 'USD'} onValueChange={setCurrency}>
                        <SelectTrigger className="h-10 bg-white border-grey-300">
                          <SelectValue placeholder="Selecciona tu moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                          <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                          <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                          <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Switch Ley 100 - Solo para Colombia */}
                {country === 'COL' && (
                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="social-charges" className="text-grey-700 font-medium cursor-pointer">
                            Cargas Prestacionales Ley 100
                          </Label>
                          <Dialog>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Ley 100 - Cargas Prestacionales</DialogTitle>
                                <DialogDescription>
                                  La Ley 100 de 1993 establece las cargas prestacionales en Colombia que incluyen:
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-2 pt-4">
                                <p className="text-sm text-grey-600">
                                  <strong>Salud:</strong> 8.5% del salario base
                                </p>
                                <p className="text-sm text-grey-600">
                                  <strong>Pensión:</strong> 12% del salario base
                                </p>
                                <p className="text-sm text-grey-600">
                                  <strong>ARL:</strong> Variable según nivel de riesgo
                                </p>
                                <p className="text-sm text-grey-600">
                                  <strong>Parafiscales:</strong> SENA, ICBF, Cajas de Compensación
                                </p>
                                <p className="text-sm text-grey-600 mt-4">
                                  Estas cargas se calcularán automáticamente en el costo real de tus recursos.
                                </p>
                              </div>
                            </DialogContent>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                <Info className="h-4 w-4 text-blue-600" />
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                        <p className="text-xs text-grey-600 mt-1">
                          Activa para incluir cargas prestacionales colombianas en el cálculo de costos
                        </p>
                      </div>
                      <Switch
                        id="social-charges"
                        checked={enableSocialCharges}
                        onCheckedChange={setEnableSocialCharges}
                      />
                    </div>
                  </div>
                )}

                {/* AI Auto-complete Button */}
                {country && currency && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <Label className="text-grey-700 font-medium">Auto-completar con IA</Label>
                        </div>
                        <p className="text-xs text-grey-600">
                          Deja que la IA sugiera roles, servicios y costos basados en tu industria
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsAIDialogOpen(true)}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Usar IA
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-grey-200">
                  <Button
                    onClick={handleContinue}
                    className="bg-primary-500 hover:bg-primary-700 text-white"
                    disabled={!country || !currency}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Perfilamiento */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <ProfileSelection
              selectedProfile={useOnboardingStore.getState().profileType}
              onSelectProfile={(profile) => {
                useOnboardingStore.getState().setProfileType(profile);
              }}
            />

            {/* Mostrar formulario condicional según perfil */}
            {useOnboardingStore.getState().profileType === 'freelance' && (
              <div className="mt-6">
                <FreelanceForm currency={currency || 'USD'} />
              </div>
            )}

            {useOnboardingStore.getState().profileType === 'company' && (
              <div className="mt-6">
                <TeamMembersTable defaultCurrency={currency || 'USD'} />
              </div>
            )}

            <div className="mt-8 flex justify-between pt-6 border-t border-grey-200">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-grey-300 text-grey-700 hover:bg-grey-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!useOnboardingStore.getState().profileType}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-grey-900 mb-2">Choose Your Industry Template</h2>
              <p className="text-grey-600">
                Select a template to get started quickly with pre-configured roles, services, and costs
              </p>
            </div>

            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={handleTemplateSelect}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-between pt-6 border-t border-grey-200">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="border-grey-300 text-grey-700 hover:bg-grey-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedTemplate}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Estructura Tributaria */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <TaxStructureForm
              country={country || 'US'}
              enableSocialCharges={enableSocialCharges}
            />
            <div className="flex justify-between pt-6 border-t border-grey-200 mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="border-grey-300 text-grey-700 hover:bg-grey-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={() => setStep(5)}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Resumen en Vivo */}
        {step === 5 && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-grey-900">Resumen y Cálculo BCR</CardTitle>
                    <CardDescription className="text-grey-600">
                      Revisa tu estructura de costos y el Blended Cost Rate calculado en tiempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-grey-50 rounded-lg">
                        <h3 className="font-semibold text-grey-900 mb-2">Configuración Actual</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-grey-600">País:</span>
                            <span className="ml-2 font-medium">{country || 'No seleccionado'}</span>
                          </div>
                          <div>
                            <span className="text-grey-600">Moneda:</span>
                            <span className="ml-2 font-medium">{currency || 'USD'}</span>
                          </div>
                          <div>
                            <span className="text-grey-600">Perfil:</span>
                            <span className="ml-2 font-medium">
                              {useOnboardingStore.getState().profileType || 'No seleccionado'}
                            </span>
                          </div>
                          {enableSocialCharges && (
                            <div>
                              <span className="text-grey-600">Cargas Sociales:</span>
                              <span className="ml-2 font-medium text-blue-600">Activadas</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {useOnboardingStore.getState().profileType === 'company' && teamMembers.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-grey-900">Equipo ({teamMembers.length} miembros)</h3>
                          <div className="space-y-2">
                            {teamMembers.map((member, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-grey-50 rounded">
                                <div>
                                  <span className="font-medium">{member.name}</span>
                                  <span className="text-sm text-grey-600 ml-2">({member.role})</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-grey-600">{member.billableHours} hrs/sem</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-6 border-t border-grey-200">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="border-grey-300 text-grey-700 hover:bg-grey-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                  <Button
                    onClick={() => setStep(6)}
                    className="bg-primary-500 hover:bg-primary-700 text-white"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Sidebar with Live Summary */}
              <div className="lg:col-span-1">
                <LiveSummarySidebar />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Customization (Skipped for now) - REMOVIDO */}
        {false && step === 3 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-grey-900">Customize Your Template</CardTitle>
              <CardDescription className="text-grey-600">
                Review and adjust the suggested roles, services, and costs before finalizing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Customization UI can be added here later */}
              <div className="flex justify-between pt-6 border-t border-grey-200">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-grey-300 text-grey-700 hover:bg-grey-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-primary-500 hover:bg-primary-700 text-white"
                >
                  Continue to Confirmation
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && selectedTemplate && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <Card>
              <CardHeader className="text-center border-b border-grey-200">
                <div className={`w-20 h-20 mx-auto rounded-2xl ${selectedTemplate.color || 'bg-primary-500'} flex items-center justify-center mb-4 shadow-lg`}>
                  {getIcon(selectedTemplate.icon)}
                </div>
                <CardTitle className="text-2xl font-semibold text-grey-900">Ready to launch?</CardTitle>
                <CardDescription className="text-grey-600 mt-2">
                  We'll set up your workspace for <strong>{selectedTemplate.name}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 bg-grey-50">
                <h3 className="font-semibold text-grey-900 mb-4">What will be created:</h3>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-grey-200">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-grey-900">{rolesCount} Team Roles</p>
                      <p className="text-xs text-grey-600">
                        {selectedTemplate.suggested_roles?.slice(0, 2).map(r => r.name).join(', ')}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-grey-200">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-grey-900">{servicesCount} Service Templates</p>
                      <p className="text-xs text-grey-600">
                        {selectedTemplate.suggested_services?.slice(0, 2).map(s => s.name).join(', ')}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-grey-200">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-grey-900">{costsCount} Fixed Costs</p>
                      <p className="text-xs text-grey-600">Fixed and variable operational costs</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <Label className="text-grey-700 font-medium">Región</Label>
                    <Input
                      value={country === 'US' ? 'Estados Unidos' :
                        country === 'UK' ? 'Reino Unido' :
                          country === 'COL' ? 'Colombia' :
                            country === 'ARG' ? 'Argentina' :
                              country === 'MEX' ? 'México' :
                                country === 'ESP' ? 'España' :
                                  country === 'BR' ? 'Brasil' : country}
                      disabled
                      className="h-10 bg-grey-50 border-grey-300 text-grey-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-grey-700 font-medium">Moneda</Label>
                    <Input
                      value={currency === 'USD' ? 'USD - Dólar Estadounidense' :
                        currency === 'EUR' ? 'EUR - Euro' :
                          currency === 'COP' ? 'COP - Peso Colombiano' :
                            currency === 'ARS' ? 'ARS - Peso Argentino' :
                              currency === 'MXN' ? 'MXN - Peso Mexicano' :
                                currency === 'BRL' ? 'BRL - Real Brasileño' : currency}
                      disabled
                      className="h-10 bg-grey-50 border-grey-300 text-grey-600"
                    />
                  </div>
                  {country === 'COL' && enableSocialCharges && (
                    <div className="space-y-2">
                      <Label className="text-grey-700 font-medium">Cargas Prestacionales</Label>
                      <Input
                        value="Ley 100 - Activada"
                        disabled
                        className="h-10 bg-blue-50 border-blue-300 text-blue-700"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-grey-200">
                  <Button
                    onClick={handleFinalize}
                    className="w-full h-12 text-lg bg-primary-500 hover:bg-primary-700 text-white"
                    disabled={applyTemplate.isPending}
                  >
                    {applyTemplate.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Setting up your workspace...
                      </>
                    ) : (
                      'Launch Workspace'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep(5)}
                    disabled={applyTemplate.isPending}
                    className="border-grey-300 text-grey-700 hover:bg-grey-50"
                  >
                    Atrás
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Template Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${previewTemplate?.color || 'bg-primary-500'} shadow-lg`}>
                  {previewTemplate && getIcon(previewTemplate.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-grey-900">{previewTemplate?.name}</h3>
                  <p className="text-sm font-normal text-grey-600">Template Preview</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="roles" className="mt-4 flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="roles">Suggested Roles</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="costs">Fixed Costs</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto min-h-[300px] mt-2 border border-grey-200 rounded-lg">
                <TabsContent value="roles" className="m-0 h-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-grey-50">
                        <TableHead className="text-grey-700 font-semibold">Role</TableHead>
                        <TableHead className="text-grey-700 font-semibold">Monthly Cost</TableHead>
                        <TableHead className="text-grey-700 font-semibold">Weekly Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewTemplate?.suggested_roles?.map((role, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-grey-900">{role.name}</TableCell>
                          <TableCell className="text-grey-600">${role.monthly_cost?.toLocaleString()}</TableCell>
                          <TableCell className="text-grey-600">{role.weekly_hours}h</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="services" className="m-0 h-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-grey-50">
                        <TableHead className="text-grey-700 font-semibold">Service</TableHead>
                        <TableHead className="text-grey-700 font-semibold">Category</TableHead>
                        <TableHead className="text-grey-700 font-semibold">Default Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewTemplate?.suggested_services?.map((service, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-grey-900">{service.name}</TableCell>
                          <TableCell className="text-grey-600">{service.category}</TableCell>
                          <TableCell className="text-grey-600">
                            {service.default_hourly_rate ? `$${service.default_hourly_rate}/hr` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="costs" className="m-0 h-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-grey-50">
                        <TableHead className="text-grey-700 font-semibold">Cost Item</TableHead>
                        <TableHead className="text-grey-700 font-semibold">Category</TableHead>
                        <TableHead className="text-grey-700 font-semibold">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewTemplate?.suggested_fixed_costs?.map((cost, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-grey-900">{cost.name}</TableCell>
                          <TableCell className="text-grey-600 capitalize">{cost.category}</TableCell>
                          <TableCell className="text-grey-600">${cost.amount?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-grey-200">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(false)}
                className="border-grey-300 text-grey-700 hover:bg-grey-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelectFromModal}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                Select This Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Suggestion Dialog */}
        <AISuggestionDialog
          open={isAIDialogOpen}
          onOpenChange={setIsAIDialogOpen}
          industry={industry || 'Agencia Digital'}
          region={country || 'US'}
          currency={currency || 'USD'}
          onApply={handleApplyAISuggestions}
        />
      </div>
    </div>
  );
}

