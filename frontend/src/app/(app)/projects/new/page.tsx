"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react"
import { useGetServices, useCreateProject, useCalculateQuote, useGetTaxes } from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"
import { MESSAGES } from "@/lib/messages"
import { formatCurrency, SUPPORTED_CURRENCIES } from "@/lib/currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/logger"

interface Service {
  id: number
  name: string
  description?: string
  default_margin_target: number
  is_active: boolean
}

interface QuoteItem {
  service_id: number
  estimated_hours: number
}

interface CalculatedQuoteItem extends QuoteItem {
  service_name: string
  internal_cost: number
  client_price: number
  margin_percentage: number
}

interface CalculatedQuote {
  total_internal_cost: number
  total_client_price: number
  margin_percentage: number
  total_taxes?: number
  total_with_taxes?: number
  items: CalculatedQuoteItem[]
  taxes?: Array<{
    id: number
    name: string
    percentage: number
    amount: number
  }>
}

export default function NewQuotePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [projectName, setProjectName] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [selectedTaxIds, setSelectedTaxIds] = useState<number[]>([])
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [calculatedQuote, setCalculatedQuote] = useState<CalculatedQuote | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [marginsAlertVisible, setMarginsAlertVisible] = useState(false)

  const { data: servicesData, isLoading: servicesLoading } = useGetServices()
  const { data: taxesData, isLoading: taxesLoading } = useGetTaxes(undefined, true)
  const createProjectMutation = useCreateProject()
  const calculateQuoteMutation = useCalculateQuote()

  const services = servicesData?.items || []
  const taxes = taxesData?.items || []

  // Auto-calculate quote when items change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (quoteItems.length > 0) {
        calculateQuote()
      } else {
        setCalculatedQuote(null)
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [quoteItems, selectedTaxIds])

  const calculateQuote = async () => {
    if (quoteItems.length === 0) return
    
    setIsCalculating(true)
    try {
      const result = await calculateQuoteMutation.mutateAsync({
        items: quoteItems,
        tax_ids: selectedTaxIds,
      })
      setCalculatedQuote(result)
      
      // Check for low margins and show alert
      const hasLowMargin = result.items.some((item: any) => item.margin_percentage < 0.20)
      setMarginsAlertVisible(hasLowMargin)
    } catch (error) {
      logger.error("Error calculating quote:", error)
      toast({
        title: "Error",
        description: "Failed to calculate quote",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleAddService = () => {
    if (services.length === 0) {
      toast({
        title: "No Services",
        description: "Please add services first in Settings > Services",
        variant: "destructive",
      })
      return
    }
    
    // Find first active service not already added
    const activeServices = services.filter((s: Service) => s.is_active)
    const addedServiceIds = quoteItems.map(item => item.service_id)
    const availableService = activeServices.find((s: Service) => !addedServiceIds.includes(s.id))
    
    if (!availableService) {
      toast({
        title: "All Services Added",
        description: "All active services have been added to this quote",
      })
      return
    }
    
    setQuoteItems([...quoteItems, {
      service_id: availableService.id,
      estimated_hours: 10
    }])
  }

  const handleRemoveService = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index))
  }

  const handleHoursChange = (index: number, hours: number) => {
    const newItems = [...quoteItems]
    newItems[index].estimated_hours = hours
    setQuoteItems(newItems)
  }

  const handleServiceChange = (index: number, serviceId: string) => {
    const newItems = [...quoteItems]
    newItems[index].service_id = parseInt(serviceId)
    setQuoteItems(newItems)
  }

  const handleSubmit = async () => {
    // Validation
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      })
      return
    }
    
    if (!clientName.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      })
      return
    }
    
    if (quoteItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one service to the quote",
        variant: "destructive",
      })
      return
    }
    
    try {
      const projectData = {
        name: projectName.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || undefined,
        currency,
        tax_ids: selectedTaxIds,
        quote_items: quoteItems.map(item => ({
          service_id: item.service_id,
          estimated_hours: item.estimated_hours
        }))
      }
      
      const result = await createProjectMutation.mutateAsync(projectData)
      
      toast({
        title: "Success",
        description: MESSAGES.success.projectCreated,
      })
      
      // Redirect to the projects list
      router.push("/projects")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.error.projectCreate
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getServiceName = (serviceId: number) => {
    const service = services.find((s: Service) => s.id === serviceId)
    return service?.name || "Unknown"
  }

  const allServicesAdded = quoteItems.length >= services.filter((s: Service) => s.is_active).length

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Create New Quote</h1>
        <p className="text-muted-foreground">
          Create a new project with a detailed quote
        </p>
      </div>

      {marginsAlertVisible && calculatedQuote && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Warning: Some services have margins below 20%. Consider adjusting prices.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Basic project and client details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="projectName" className="text-sm font-medium mb-2 block">
                  Project Name *
                </label>
                <Input
                  id="projectName"
                  placeholder="e.g. Website Redesign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientName" className="text-sm font-medium mb-2 block">
                    Client Name *
                  </label>
                  <Input
                    id="clientName"
                    placeholder="e.g. Acme Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="clientEmail" className="text-sm font-medium mb-2 block">
                    Client Email
                  </label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="currency" className="text-sm font-medium mb-2 block">
                  Currency *
                </label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Taxes (Optional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {taxesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading taxes...</p>
                  ) : taxes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No taxes available. Create taxes in Settings.</p>
                  ) : (
                    taxes.map((tax: any) => (
                      <div key={tax.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`tax-${tax.id}`}
                          checked={selectedTaxIds.includes(tax.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTaxIds([...selectedTaxIds, tax.id])
                            } else {
                              setSelectedTaxIds(selectedTaxIds.filter(id => id !== tax.id))
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`tax-${tax.id}`} className="text-sm cursor-pointer flex-1">
                          {tax.name} ({tax.code}) - {tax.percentage}%
                          {tax.country && <span className="text-muted-foreground"> - {tax.country}</span>}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Add services to this quote</CardDescription>
                </div>
                <Button
                  onClick={handleAddService}
                  disabled={servicesLoading || allServicesAdded || createProjectMutation.isPending}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quoteItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Add Service" to start building your quote
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={item.service_id.toString()}
                              onValueChange={(val) => handleServiceChange(index, val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {services
                                  .filter((s: Service) => s.is_active)
                                  .map((service: Service) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                      {service.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                step="0.5"
                                value={item.estimated_hours}
                                onChange={(e) => handleHoursChange(index, parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveService(index)}
                                disabled={createProjectMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isCalculating ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : calculatedQuote ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Internal Cost:</span>
                      <span className="font-medium">{formatCurrency(calculatedQuote.total_internal_cost, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(calculatedQuote.total_client_price, currency)}</span>
                    </div>
                    {calculatedQuote.taxes && calculatedQuote.taxes.length > 0 && (
                      <>
                        {calculatedQuote.taxes.map((tax: any) => (
                          <div key={tax.id} className="flex justify-between text-xs border-b pb-1">
                            <span className="text-muted-foreground">
                              {tax.name} ({tax.percentage}%):
                            </span>
                            <span>{formatCurrency(tax.amount, currency)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm border-t pt-1 mt-1">
                          <span className="text-muted-foreground">Total Taxes:</span>
                          <span className="font-medium">
                            {formatCurrency(calculatedQuote.total_taxes || 0, currency)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm border-t pt-2 font-bold">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="text-lg">
                        {formatCurrency(calculatedQuote.total_with_taxes || calculatedQuote.total_client_price, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-muted-foreground">Margin:</span>
                      <span className={`font-bold ${
                        calculatedQuote.margin_percentage >= 0.2 
                          ? "text-green-600" 
                          : calculatedQuote.margin_percentage >= 0.15
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                        {(calculatedQuote.margin_percentage * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-xs font-semibold mb-2 text-muted-foreground">BREAKDOWN</div>
                    {calculatedQuote.items.map((item, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="text-xs font-medium mb-1">{item.service_name}</div>
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Hours:</span>
                            <span>{item.estimated_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span>{formatCurrency(item.internal_cost, currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price:</span>
                            <span>{formatCurrency(item.client_price, currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margin:</span>
                            <span className={
                              item.margin_percentage >= 0.2 ? "text-green-600" : 
                              item.margin_percentage >= 0.15 ? "text-yellow-600" : 
                              "text-red-600"
                            }>
                              {(item.margin_percentage * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Add services to see calculation
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/projects")}
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={
                createProjectMutation.isPending ||
                !projectName.trim() ||
                !clientName.trim() ||
                quoteItems.length === 0
              }
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Quote"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
