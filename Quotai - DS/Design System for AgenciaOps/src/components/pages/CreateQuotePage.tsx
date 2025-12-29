import { useState } from 'react';
import { Plus, Trash, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { mockServices, mockCurrencies } from '../../lib/mock-data';

interface QuoteService {
  id: string;
  serviceId: string;
  serviceName: string;
  hours: number;
  hourlyRate: number;
}

interface CreateQuotePageProps {
  onNavigate: (page: string) => void;
}

export function CreateQuotePage({ onNavigate }: CreateQuotePageProps) {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [services, setServices] = useState<QuoteService[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tax rate (20%)
  const TAX_RATE = 0.20;
  
  // Cost rate assumption (60% of hourly rate for margin calculation)
  const COST_RATE = 0.60;

  // Add service
  const addService = () => {
    const newService: QuoteService = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: '',
      serviceName: '',
      hours: 0,
      hourlyRate: 0
    };
    setServices([...services, newService]);
  };

  // Remove service
  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  // Update service
  const updateService = (id: string, field: keyof QuoteService, value: any) => {
    setServices(services.map(s => {
      if (s.id === id) {
        if (field === 'serviceId') {
          const selectedService = mockServices.find(ms => ms.id === value);
          return {
            ...s,
            serviceId: value,
            serviceName: selectedService?.name || '',
            hourlyRate: selectedService?.defaultHourlyRate || 0
          };
        }
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  // Calculate totals
  const subtotal = services.reduce((sum, s) => sum + (s.hours * s.hourlyRate), 0);
  const taxes = includeTaxes ? subtotal * TAX_RATE : 0;
  const total = subtotal + taxes;
  
  // Calculate margin
  const totalCost = services.reduce((sum, s) => sum + (s.hours * s.hourlyRate * COST_RATE), 0);
  const margin = subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;
  
  const isLowMargin = margin > 0 && margin < 30;
  const isFormValid = projectName && clientName && services.length > 0 && 
    services.every(s => s.serviceId && s.hours > 0);

  const handleSave = () => {
    if (!isFormValid) return;
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onNavigate('projects');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-grey-900">Create New Quote</h2>
        <p className="text-grey-600 mt-1">Fill in the project details and add services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <div className="bg-white rounded-xl border border-grey-200 p-6" style={{ boxShadow: 'var(--elevation-2)' }}>
            <h3 className="mb-6">Project Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name" className="text-grey-700">
                  Project Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Website Redesign for Tech Corp"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2 bg-white border-grey-300"
                />
              </div>

              <div>
                <Label htmlFor="client-name" className="text-grey-700">
                  Client Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="client-name"
                  placeholder="e.g., Tech Corp Solutions"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-2 bg-white border-grey-300"
                />
              </div>

              <div>
                <Label htmlFor="client-email" className="text-grey-700">Client Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="contact@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-2 bg-white border-grey-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency" className="text-grey-700">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency" className="mt-2 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCurrencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="include-taxes" 
                      checked={includeTaxes}
                      onCheckedChange={(checked) => setIncludeTaxes(checked as boolean)}
                    />
                    <Label htmlFor="include-taxes" className="text-grey-700">
                      Include taxes (20%)
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl border border-grey-200 p-6" style={{ boxShadow: 'var(--elevation-2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3>Services</h3>
              <Button 
                onClick={addService}
                variant="outline"
                className="border-primary-500 text-primary-500 hover:bg-primary-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={service.id} className="p-4 border border-grey-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <Label className="text-grey-700">Service</Label>
                        <Select 
                          value={service.serviceId} 
                          onValueChange={(value) => updateService(service.id, 'serviceId', value)}
                        >
                          <SelectTrigger className="mt-2 bg-white">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockServices.map(s => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} (${s.defaultHourlyRate}/hr)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3">
                        <Label className="text-grey-700">Hours</Label>
                        <Input
                          type="number"
                          min="0"
                          value={service.hours || ''}
                          onChange={(e) => updateService(service.id, 'hours', parseFloat(e.target.value) || 0)}
                          className="mt-2 bg-white border-grey-300"
                          placeholder="0"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Label className="text-grey-700">Subtotal</Label>
                        <div className="mt-2 h-10 px-3 flex items-center bg-grey-50 border border-grey-200 rounded-lg text-grey-900">
                          ${(service.hours * service.hourlyRate).toLocaleString()}
                        </div>
                      </div>

                      <div className="md:col-span-1 flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(service.id)}
                          className="w-full md:w-auto text-error-500 hover:text-error-700 hover:bg-error-50"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-grey-300 rounded-lg">
                <p className="text-grey-600 mb-4">No services added yet</p>
                <Button 
                  onClick={addService}
                  variant="outline"
                  className="border-primary-500 text-primary-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Service
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Quote Summary - Sticky */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-xl border border-grey-200 p-6" style={{ boxShadow: 'var(--elevation-2)' }}>
              <h3 className="mb-6">Quote Summary</h3>

              {isCalculating ? (
                <div className="py-8 text-center">
                  <Loader className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-grey-600">Calculating...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-grey-700">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {includeTaxes && (
                      <div className="flex justify-between text-grey-700">
                        <span>Taxes (20%)</span>
                        <span>${taxes.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-grey-200 pt-4">
                    <div className="flex justify-between text-grey-900">
                      <span>Total</span>
                      <span className="text-2xl">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Margin Indicator */}
                  {services.length > 0 && (
                    <div className="pt-4 border-t border-grey-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-grey-700">Estimated Margin</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          margin >= 40 
                            ? 'bg-success-50 text-success-700' 
                            : margin >= 30 
                            ? 'bg-warning-50 text-warning-700' 
                            : 'bg-error-50 text-error-700'
                        }`}>
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-grey-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            margin >= 40 
                              ? 'bg-success-500' 
                              : margin >= 30 
                              ? 'bg-warning-500' 
                              : 'bg-error-500'
                          }`}
                          style={{ width: `${Math.min(margin, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Low Margin Warning */}
                  {isLowMargin && (
                    <div className="p-3 bg-warning-50 border border-warning-500 rounded-lg flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning-700 flex-shrink-0" />
                      <p className="text-warning-700 text-xs">
                        Low margin detected. Consider adjusting rates or hours to improve profitability.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={handleSave}
                      disabled={!isFormValid || isSaving}
                      className="w-full bg-primary-500 hover:bg-primary-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Quote'
                      )}
                    </Button>
                    <Button
                      onClick={() => onNavigate('projects')}
                      variant="outline"
                      className="w-full border-grey-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
