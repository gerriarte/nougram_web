"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Plus, Trash2, Loader2, AlertCircle, ArrowLeft, Copy } from "lucide-react"
import { useGetServices, useGetProjectQuotes, useGetProject, useGetQuote, useCreateQuoteVersion, useCalculateQuote } from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { logger } from "@/lib/logger"

interface QuoteItem {
  service_id: number
  estimated_hours: number
}

export default function NewQuoteVersionPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = parseInt(params.id as string)
  const { toast } = useToast()

  const { data: project, isLoading: projectLoading } = useGetProject(projectId)
  const { data: quotes, isLoading: quotesLoading } = useGetProjectQuotes(projectId)
  const { data: servicesData, isLoading: servicesLoading } = useGetServices()
  const createVersionMutation = useCreateQuoteVersion()
  const calculateQuoteMutation = useCalculateQuote()

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState("")
  const [calculatedQuote, setCalculatedQuote] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [marginsAlertVisible, setMarginsAlertVisible] = useState(false)
  const [targetMargin, setTargetMargin] = useState<number>(0.40) // 40% por defecto

  const services = servicesData?.items || []
  const latestQuote = quotes && quotes.length > 0 ? quotes[0] : null
  
  // Load latest quote details only if there's a quote
  const { data: latestQuoteDetails } = useGetQuote(
    projectId,
    latestQuote?.id || 0
  )

  // Load latest quote data when available to pre-fill the form
  useEffect(() => {
    if (latestQuote && latestQuote.id && latestQuoteDetails && latestQuoteDetails.items && quoteItems.length === 0) {
      const items = latestQuoteDetails.items.map((item: any) => ({
        service_id: item.service_id,
        estimated_hours: item.estimated_hours,
      }))
      setQuoteItems(items)
      setNotes(latestQuoteDetails.notes || "")
      setTargetMargin(latestQuoteDetails.target_margin_percentage ?? 0.40) // Load target margin or default to 40%
    }
  }, [latestQuote, latestQuoteDetails, quoteItems.length])

  // Auto-calculate quote when items or target margin change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (quoteItems.length > 0) {
        calculateQuote()
      } else {
        setCalculatedQuote(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [quoteItems, targetMargin])

  const calculateQuote = async () => {
    if (quoteItems.length === 0) return

    setIsCalculating(true)
    try {
      const taxIds = project?.tax_ids || []
      const result = await calculateQuoteMutation.mutateAsync({
        items: quoteItems,
        tax_ids: taxIds,
        target_margin_percentage: targetMargin,  // Include target margin
      })
      setCalculatedQuote(result)

      const hasLowMargin = result.items.some((item: any) => item.margin_percentage < 0.20)
      setMarginsAlertVisible(hasLowMargin)
    } catch (error) {
      logger.error("Error calculating quote:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleAddService = () => {
    if (services.length > 0) {
      setQuoteItems([
        ...quoteItems,
        {
          service_id: services[0].id,
          estimated_hours: 0,
        },
      ])
    }
  }

  const handleRemoveService = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index))
  }

  const handleServiceChange = (index: number, field: keyof QuoteItem, value: number) => {
    const updated = [...quoteItems]
    updated[index] = { ...updated[index], [field]: value }
    setQuoteItems(updated)
  }

  const handleSubmit = async () => {
    if (quoteItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one service to the quote",
        variant: "destructive",
      })
      return
    }

    if (quoteItems.some(item => item.estimated_hours <= 0)) {
      toast({
        title: "Error",
        description: "All services must have estimated hours greater than 0",
        variant: "destructive",
      })
      return
    }

    // If no existing quote, we need to create the first quote using createProject endpoint
    if (!latestQuote) {
      // For first quote, redirect to create project page or use a different endpoint
      toast({
        title: "Info",
        description: "Creating first quote. Please use 'New Quote' from the projects page.",
        variant: "default",
      })
      router.push("/projects/new")
      return
    }

    try {
      await createVersionMutation.mutateAsync({
        projectId,
        quoteId: latestQuote.id,
        data: {
          items: quoteItems,
          notes: notes || null,
          target_margin_percentage: targetMargin,  // Include target margin
        },
      })
      toast({
        title: "Success",
        description: "New quote version created successfully",
      })
      router.push(`/projects/${projectId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create new version"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (projectLoading || quotesLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextVersion = latestQuote ? latestQuote.version + 1 : 1

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Quote Version</h1>
            <p className="text-muted-foreground">
              Creating version {nextVersion} for {project.name}
            </p>
          </div>
        </div>
      </div>

      {marginsAlertVisible && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some services have margins below 20%. Consider adjusting pricing.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quote Items</CardTitle>
            <CardDescription>
              {latestQuote ? "Based on version " + latestQuote.version : "Add services and estimated hours"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quoteItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No services added yet</p>
                <Button onClick={handleAddService} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Service
                </Button>
              </div>
            ) : (
              <>
                {quoteItems.map((item, index) => {
                  const service = services.find((s) => s.id === item.service_id)
                  const calculatedItem = calculatedQuote?.items.find(
                    (ci: any) => ci.service_id === item.service_id
                  )

                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {service?.name || "Select service"}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveService(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Service</label>
                        <Select
                          value={item.service_id.toString()}
                          onValueChange={(value) =>
                            handleServiceChange(index, "service_id", parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estimated Hours</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.estimated_hours || ""}
                          onChange={(e) =>
                            handleServiceChange(
                              index,
                              "estimated_hours",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      {calculatedItem && (
                        <div className="text-sm space-y-1 pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Internal Cost:</span>
                            <span>{formatCurrency(calculatedItem.internal_cost, project.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Client Price:</span>
                            <span className="font-medium">
                              {formatCurrency(calculatedItem.client_price, project.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Margin:</span>
                            <span
                              className={
                                calculatedItem.margin_percentage < 0.20
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {(calculatedItem.margin_percentage * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                <Button onClick={handleAddService} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
            <CardDescription>Calculated totals for version {nextVersion}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCalculating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : calculatedQuote ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Total Internal Cost:</span>
                    <span className="font-medium">
                      {formatCurrency(calculatedQuote.total_internal_cost, project.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-lg font-medium">
                      {formatCurrency(calculatedQuote.total_client_price, project.currency)}
                    </span>
                  </div>
                  {calculatedQuote.taxes && calculatedQuote.taxes.length > 0 && (
                    <>
                      {calculatedQuote.taxes.map((tax: any) => (
                        <div key={tax.id} className="flex justify-between text-sm border-b pb-1">
                          <span className="text-muted-foreground">
                            {tax.name} ({tax.percentage}%):
                          </span>
                          <span>{formatCurrency(tax.amount, project.currency)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-muted-foreground">Total Taxes:</span>
                        <span className="font-medium">
                          {formatCurrency(calculatedQuote.total_taxes || 0, project.currency)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground font-medium">Total:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(calculatedQuote.total_with_taxes || calculatedQuote.total_client_price, project.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Target Margin:</span>
                    <span className="font-medium">
                      {(targetMargin * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Actual Margin:</span>
                    <span
                      className={`text-lg font-bold ${
                        calculatedQuote.margin_percentage < 0.20
                          ? "text-destructive"
                          : "text-green-600"
                      }`}
                    >
                      {(calculatedQuote.margin_percentage * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div>
                    <label htmlFor="target-margin" className="text-sm font-medium mb-2 block">
                      Target Margin (%)
                    </label>
                    <Input
                      id="target-margin"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(targetMargin * 100).toFixed(1)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) / 100
                        if (!isNaN(value) && value >= 0 && value <= 1) {
                          setTargetMargin(value)
                        }
                      }}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Set the target profit margin for this quote (0-100%)
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-sm font-medium mb-2 block">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this quote version..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={
                      createVersionMutation.isPending ||
                      quoteItems.length === 0 ||
                      !latestQuote
                    }
                  >
                    {createVersionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Create Version {nextVersion}
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Add services to see quote summary</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

