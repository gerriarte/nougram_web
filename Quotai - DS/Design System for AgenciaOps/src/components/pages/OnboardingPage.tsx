import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Check, Palette, Code, Megaphone, Briefcase, Video, ChevronRight, ArrowLeft, Loader2, Users, Package, DollarSign } from 'lucide-react';
import { mockIndustryTemplates, currentUser } from '../../lib/mock-data';
import { IndustryTemplate, TeamCost, Service, CompanyCost } from '../../lib/types';
import { TemplateCard } from '../ui/TemplateCard';

interface OnboardingPageProps {
    onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<IndustryTemplate | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Customization State (initialized when template is selected)
    const [customRoles, setCustomRoles] = useState<TeamCost[]>([]);
    const [customServices, setCustomServices] = useState<Service[]>([]);
    const [customCosts, setCustomCosts] = useState<CompanyCost[]>([]);

    const handleTemplateSelect = (template: IndustryTemplate) => {
        setSelectedTemplate(template);
        setCustomRoles(template.suggestedRoles);
        setCustomServices(template.suggestedServices);
        setCustomCosts(template.suggestedCompanyCosts);
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
        if (step === 2 && selectedTemplate) {
            setStep(4); // Skip to confirmation for now
        } else {
            setStep(step + 1);
        }
    };

    const handleFinalize = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onComplete();
        }, 2000);
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Palette': return <Palette className="w-12 h-12 text-white" />;
            case 'Code': return <Code className="w-12 h-12 text-white" />;
            case 'Megaphone': return <Megaphone className="w-12 h-12 text-white" />;
            case 'Briefcase': return <Briefcase className="w-12 h-12 text-white" />;
            case 'Video': return <Video className="w-12 h-12 text-white" />;
            default: return <Briefcase className="w-12 h-12 text-white" />;
        }
    };

    return (
        <div className="min-h-screen bg-grey-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-grey-900">Welcome to AgenciaOps</h1>
                        <p className="text-grey-600">Let's set up your organization workspace</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-grey-500">Step {step} of 4</span>
                        <div className="w-32 h-2 bg-grey-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-600 transition-all duration-500"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Step 1: Basic Info Confirmation */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold mb-6">Confirm Organization Details</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label>Organization Name</Label>
                                    <div className="mt-2 p-3 bg-grey-50 rounded-lg border border-grey-200 text-grey-900">
                                        Acme Creative Agency
                                    </div>
                                </div>
                                <div>
                                    <Label>Organization URL</Label>
                                    <div className="mt-2 p-3 bg-grey-50 rounded-lg border border-grey-200 text-grey-900">
                                        agenciaops.com/acme-creative
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label>Default Currency</Label>
                                    <div className="mt-2 p-3 bg-grey-50 rounded-lg border border-grey-200 text-grey-900">
                                        USD - US Dollar
                                    </div>
                                </div>
                                <div>
                                    <Label>Region</Label>
                                    <div className="mt-2 p-3 bg-grey-50 rounded-lg border border-grey-200 text-grey-900">
                                        United States
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={() => setStep(2)}
                                    className="bg-primary-600 hover:bg-primary-700 text-white"
                                >
                                    Continue
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Industry Selection */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col h-full">
                        <div className="text-center mb-8 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-normal text-grey-900 mb-2">Choose Your Industry Template</h2>
                            <p className="text-grey-600 text-base">
                                Select a template that matches your agency type. We'll pre-configure roles, services, and costs to get you started quickly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-12 mb-24">
                            {mockIndustryTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    isSelected={selectedTemplate?.id === template.id}
                                    onSelect={handleTemplateSelect}
                                    onViewDetails={handleViewDetails}
                                    isRecommended={template.id === 'branding'} // Mock recommendation
                                />
                            ))}
                        </div>

                        {/* Footer Navigation */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-200 p-6 z-10">
                            <div className="max-w-7xl mx-auto flex justify-between items-center">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleContinue}
                                    disabled={!selectedTemplate}
                                    className="bg-primary-600 hover:bg-primary-700 text-white min-w-[120px]"
                                >
                                    Continue
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Customization */}
                {step === 3 && (
                    <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-8 animate-in fade-in slide-in-from-bottom-4 flex flex-col h-full">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-grey-900">Customize your Workspace</h2>
                            <p className="text-grey-600">Review and adjust the suggested configuration for your agency.</p>
                        </div>

                        <Tabs defaultValue="roles" className="flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="roles">Team Roles ({customRoles.length})</TabsTrigger>
                                <TabsTrigger value="services">Services ({customServices.length})</TabsTrigger>
                                <TabsTrigger value="costs">Company Costs ({customCosts.length})</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto border rounded-md min-h-[400px]">
                                <TabsContent value="roles" className="m-0 h-full">
                                    <table className="w-full">
                                        <thead className="bg-grey-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Role Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Hourly Rate</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Monthly Cost (Est.)</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-grey-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-grey-200">
                                            {customRoles.map((role, index) => (
                                                <tr key={role.id} className="hover:bg-grey-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-grey-900">
                                                        <Input
                                                            value={role.name}
                                                            onChange={(e) => {
                                                                const newRoles = [...customRoles];
                                                                newRoles[index].name = e.target.value;
                                                                setCustomRoles(newRoles);
                                                            }}
                                                            className="h-8 w-full max-w-[200px]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-grey-600">
                                                        <div className="flex items-center">
                                                            <span className="mr-1">$</span>
                                                            <Input
                                                                type="number"
                                                                value={role.hourlyRate}
                                                                onChange={(e) => {
                                                                    const newRoles = [...customRoles];
                                                                    newRoles[index].hourlyRate = Number(e.target.value);
                                                                    newRoles[index].monthlyCost = Number(e.target.value) * role.weeklyHours * 4;
                                                                    setCustomRoles(newRoles);
                                                                }}
                                                                className="h-8 w-20"
                                                            />
                                                            <span className="ml-1 text-grey-400">/hr</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-grey-600">
                                                        ${role.monthlyCost.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                const newRoles = customRoles.filter((_, i) => i !== index);
                                                                setCustomRoles(newRoles);
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {customRoles.length === 0 && (
                                        <div className="p-8 text-center text-grey-500">
                                            No roles defined.
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="services" className="m-0 h-full">
                                    <table className="w-full">
                                        <thead className="bg-grey-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Service Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Category</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Default Rate</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-grey-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-grey-200">
                                            {customServices.map((service, index) => (
                                                <tr key={service.id} className="hover:bg-grey-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-grey-900">
                                                        <Input
                                                            value={service.name}
                                                            onChange={(e) => {
                                                                const newServices = [...customServices];
                                                                newServices[index].name = e.target.value;
                                                                setCustomServices(newServices);
                                                            }}
                                                            className="h-8 w-full max-w-[200px]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-grey-600">
                                                        <Input
                                                            value={service.category}
                                                            onChange={(e) => {
                                                                const newServices = [...customServices];
                                                                newServices[index].category = e.target.value;
                                                                setCustomServices(newServices);
                                                            }}
                                                            className="h-8 w-full max-w-[150px]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-grey-600">
                                                        <div className="flex items-center">
                                                            <span className="mr-1">$</span>
                                                            <Input
                                                                type="number"
                                                                value={service.defaultHourlyRate}
                                                                onChange={(e) => {
                                                                    const newServices = [...customServices];
                                                                    newServices[index].defaultHourlyRate = Number(e.target.value);
                                                                    setCustomServices(newServices);
                                                                }}
                                                                className="h-8 w-20"
                                                            />
                                                            <span className="ml-1 text-grey-400">/hr</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                const newServices = customServices.filter((_, i) => i !== index);
                                                                setCustomServices(newServices);
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </TabsContent>

                                <TabsContent value="costs" className="m-0 h-full">
                                    <table className="w-full">
                                        <thead className="bg-grey-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Cost Item</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-grey-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-grey-200">
                                            {customCosts.map((cost, index) => (
                                                <tr key={cost.id} className="hover:bg-grey-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-grey-900">
                                                        <Input
                                                            value={cost.name}
                                                            onChange={(e) => {
                                                                const newCosts = [...customCosts];
                                                                newCosts[index].name = e.target.value;
                                                                setCustomCosts(newCosts);
                                                            }}
                                                            className="h-8 w-full max-w-[200px]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-grey-600 capitalize">
                                                        {cost.type}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-grey-600">
                                                        <div className="flex items-center">
                                                            <span className="mr-1">$</span>
                                                            <Input
                                                                type="number"
                                                                value={cost.amount}
                                                                onChange={(e) => {
                                                                    const newCosts = [...customCosts];
                                                                    newCosts[index].amount = Number(e.target.value);
                                                                    setCustomCosts(newCosts);
                                                                }}
                                                                className="h-8 w-24"
                                                            />
                                                            <span className="ml-1 text-grey-400 text-xs">({cost.frequency})</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                const newCosts = customCosts.filter((_, i) => i !== index);
                                                                setCustomCosts(newCosts);
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <div className="pt-6 flex justify-between border-t border-grey-100 mt-4">
                            <Button variant="ghost" onClick={() => setStep(2)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Selection
                            </Button>
                            <Button
                                onClick={() => setStep(4)}
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                            >
                                Continue to Confirmation
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white rounded-xl shadow-sm border border-grey-200 overflow-hidden">
                            <div className="p-8 text-center border-b border-grey-100">
                                <div className={`w-20 h-20 mx-auto rounded-2xl ${selectedTemplate?.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    {selectedTemplate && getIcon(selectedTemplate.icon)}
                                </div>
                                <h2 className="text-2xl font-bold text-grey-900">Ready to launch?</h2>
                                <p className="text-grey-600 mt-2">
                                    We'll set up your workspace for <strong>{selectedTemplate?.name}</strong>
                                </p>
                            </div>

                            <div className="p-8 bg-grey-50">
                                <h3 className="font-medium text-grey-900 mb-4">What will be created:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-grey-200">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-grey-900">{customRoles.length} Team Roles</p>
                                            <p className="text-xs text-grey-500">Including {customRoles.map(r => r.name).slice(0, 2).join(', ')}...</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-grey-200">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-grey-900">{customServices.length} Service Templates</p>
                                            <p className="text-xs text-grey-500">Including {customServices.map(s => s.name).slice(0, 2).join(', ')}...</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-grey-200">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-grey-900">{customCosts.length} Company Costs</p>
                                            <p className="text-xs text-grey-500">Fixed and variable operational costs</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <Button
                                        onClick={handleFinalize}
                                        className="w-full h-12 text-lg bg-primary-600 hover:bg-primary-700 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Setting up your workspace...
                                            </>
                                        ) : (
                                            'Launch Workspace'
                                        )}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setStep(2)} disabled={isLoading}>
                                        Back to Selection
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Template Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${previewTemplate?.color}`}>
                                {previewTemplate && getIcon(previewTemplate.icon)}
                            </div>
                            <div>
                                <h3 className="text-xl">{previewTemplate?.name}</h3>
                                <p className="text-sm font-normal text-grey-500">Template Preview</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="roles" className="mt-4 flex-1 overflow-hidden flex flex-col">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="roles">Suggested Roles</TabsTrigger>
                            <TabsTrigger value="services">Services</TabsTrigger>
                            <TabsTrigger value="costs">Company Costs</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto min-h-[300px] mt-2 border rounded-md">
                            <TabsContent value="roles" className="m-0 h-full">
                                <table className="w-full">
                                    <thead className="bg-grey-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Role</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Rate</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Monthly Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewTemplate?.suggestedRoles.map((role) => (
                                            <tr key={role.id} className="border-b border-grey-100 last:border-0">
                                                <td className="px-4 py-3 text-sm font-medium">{role.name}</td>
                                                <td className="px-4 py-3 text-sm text-grey-600">${role.hourlyRate}/hr</td>
                                                <td className="px-4 py-3 text-sm text-grey-600">${role.monthlyCost.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TabsContent>

                            <TabsContent value="services" className="m-0 h-full">
                                <table className="w-full">
                                    <thead className="bg-grey-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Service</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Category</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Default Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewTemplate?.suggestedServices.map((service) => (
                                            <tr key={service.id} className="border-b border-grey-100 last:border-0">
                                                <td className="px-4 py-3 text-sm font-medium">{service.name}</td>
                                                <td className="px-4 py-3 text-sm text-grey-600">{service.category}</td>
                                                <td className="px-4 py-3 text-sm text-grey-600">${service.defaultHourlyRate}/hr</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TabsContent>

                            <TabsContent value="costs" className="m-0 h-full">
                                <table className="w-full">
                                    <thead className="bg-grey-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Cost Item</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-grey-500">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewTemplate?.suggestedCompanyCosts.map((cost) => (
                                            <tr key={cost.id} className="border-b border-grey-100 last:border-0">
                                                <td className="px-4 py-3 text-sm font-medium">{cost.name}</td>
                                                <td className="px-4 py-3 text-sm text-grey-600 capitalize">{cost.type}</td>
                                                <td className="px-4 py-3 text-sm text-grey-600">${cost.amount.toLocaleString()} ({cost.frequency})</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-grey-100">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cancel</Button>
                        <Button onClick={handleSelectFromModal} className="bg-primary-600 text-white">Select This Template</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
