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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Loader2, AlertCircle, ArrowLeft, Save, Copy, Download, Mail, FileText } from "lucide-react"
import { useGetServices, useGetQuote, useGetProject, useUpdateQuote, useCreateQuoteVersion, useCalculateQuote, useGetCurrentUser } from "@/lib/queries"
import { canSendQuotes } from "@/lib/permissions"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { downloadPDF, downloadDOCX } from "@/lib/api-client"
import { logger } from "@/lib/logger"
import { SendEmailDialog } from "@/components/quotes/send-email-dialog"
import { ExpensesSection } from "@/components/quotes/expenses-section"
import { useGetQuoteExpenses, type QuoteExpense } from "@/lib/queries"

interface Service {
  id: number
  name: string
  description?: string
  default_margin_target: number
  is_active: boolean
  pricing_type?: string
  fixed_price?: number
  is_recurring?: boolean
  billing_frequency?: string
  recurring_price?: number
}

interface QuoteItem {
  service_id: number
  estimated_hours: number
}

export default function EditQuotePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = parseInt(params.id as string)
  const quoteId = parseInt(params.quoteId as string)
  const { toast } = useToast()

  const { data: quote, isLoading: quoteLoading } = useGetQuote(projectId, quoteId)
  const { data: project } = useGetProject(projectId)
  const { data: servicesData, isLoading: servicesLoading } = useGetServices()
  const { data: currentUser } = useGetCurrentUser()
  const updateQuoteMutation = useUpdateQuote()
  const createVersionMutation = useCreateQuoteVersion()
  const calculateQuoteMutation = useCalculateQuote()
  const canSendQuotesPermission = canSendQuotes(currentUser)

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState("")
  const [calculatedQuote, setCalculatedQuote] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [marginsAlertVisible, setMarginsAlertVisible] = useState(false)
  const [createNewVersion, setCreateNewVersion] = useState(false)
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false)
  const [expenses, setExpenses] = useState<QuoteExpense[]>([])
  const [revisionsIncluded, setRevisionsIncluded] = useState<number>(2)
  const [revisionCostPerAdditional, setRevisionCostPerAdditional] = useState<number | undefined>(undefined)
  const [targetMargin, setTargetMargin] = useState<number>(0.40) // 40% por defecto

  const services = ((servicesData as any)?.items && Array.isArray((servicesData as any).items)) ? (servicesData as any).items : []
  const { data: expensesData } = useGetQuoteExpenses(projectId, quoteId)
  
  // Update expenses when data changes
  useEffect(() => {
    if (expensesData) {
      setExpenses(expensesData)
    }
  }, [expensesData])

  // Load quote data when available
  useEffect(() => {
    if (quote && (quote as any).items) {
      const items = ((quote as any).items as Array<{ service_id: number; estimated_hours?: number }>).map((item) => ({
        service_id: item.service_id,
        estimated_hours: item.estimated_hours || 0,
      }))
      setQuoteItems(items)
      setNotes((quote as any).notes || "")
      setRevisionsIncluded((quote as any).revisions_included ?? 2)
      setRevisionCostPerAdditional((quote as any).revision_cost_per_additional ?? undefined)
      setTargetMargin((quote as any).target_margin_percentage ?? 0.40) // Load target margin or default to 40%
    }
  }, [quote])

  // Auto-calculate quote when items, expenses, revisions, or target margin change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (quoteItems.length > 0 || expenses.length > 0) {
        calculateQuote()
      } else {
        setCalculatedQuote(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [quoteItems, expenses, revisionsIncluded, revisionCostPerAdditional, targetMargin])

  const calculateQuote = async () => {
    if (quoteItems.length === 0 && expenses.length === 0) return

    setIsCalculating(true)
    try {
      const taxIds = (project as any)?.tax_ids || []
      // Convert expenses to format expected by API
      const expensesForCalculation = expenses.map((exp: QuoteExpense): {
        name: string
        description?: string
        cost: number
        markup_percentage: number
        category?: string
        quantity: number
      } => ({
        name: exp.name,
        description: exp.description,
        cost: exp.cost,
        markup_percentage: exp.markup_percentage,
        category: exp.category,
        quantity: exp.quantity,
      }))
      
      const result = await calculateQuoteMutation.mutateAsync({
        items: quoteItems,
        expenses: expensesForCalculation,
        tax_ids: taxIds,
        target_margin_percentage: targetMargin,  // Include target margin
        revisions_included: revisionsIncluded,
        revision_cost_per_additional: revisionCostPerAdditional,
        revisions_count: undefined, // Only used when calculating additional revision costs
      }) as any
      setCalculatedQuote(result)

      const hasLowMargin = (result as any).items?.some((item: any) => item.margin_percentage < 0.20) || false
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

    try {
      if (createNewVersion) {
        await createVersionMutation.mutateAsync({
          projectId,
          quoteId,
          data: {
            items: quoteItems,
            notes: notes || null,
            revisions_included: revisionsIncluded,
            revision_cost_per_additional: revisionCostPerAdditional ?? null,
          },
        })
        toast({
          title: "Success",
          description: "New quote version created successfully",
        })
      } else {
        await updateQuoteMutation.mutateAsync({
          projectId,
          quoteId,
          data: {
            items: quoteItems,
            notes: notes || null,
            target_margin_percentage: targetMargin,  // Include target margin
            revisions_included: revisionsIncluded,
            revision_cost_per_additional: revisionCostPerAdditional ?? null,
          } as any,
        })
        toast({
          title: "Success",
          description: "Quote updated successfully",
        })
      }
      router.push(`/projects/${projectId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save quote"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (quoteLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Quote not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Quote v{(quote as any)?.version || 1}</h1>
            <p className="text-muted-foreground">Update quote items and pricing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const safeProjectName = (project as any)?.name?.replace(/[^a-z0-9]/gi, '_') || 'project'
                const filename = `cotizacion_${safeProjectName}_v${(quote as any)?.version || 1}.pdf`
                await downloadPDF(`/projects/${projectId}/quotes/${quoteId}/pdf`, filename)
                toast({
                  title: "PDF descargado",
                  description: "La cotización se ha descargado correctamente",
                })
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message || "No se pudo descargar el PDF",
                  variant: "destructive",
                })
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const safeProjectName = (project as any)?.name?.replace(/[^a-z0-9]/gi, '_') || 'project'
                const filename = `cotizacion_${safeProjectName}_v${(quote as any)?.version || 1}.docx`
                await downloadDOCX(`/projects/${projectId}/quotes/${quoteId}/docx`, filename)
                toast({
                  title: "DOCX descargado",
                  description: "La cotización se ha descargado correctamente",
                })
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message || "No se pudo descargar el DOCX",
                  variant: "destructive",
                })
              }
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Descargar DOCX
          </Button>
          {canSendQuotesPermission && (
            <Button
              variant="outline"
              onClick={() => setSendEmailDialogOpen(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
          )}
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

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
              <CardDescription>Add services and estimated hours</CardDescription>
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
                  const service = services.find((s: Service) => s.id === item.service_id)
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
                            {services.map((s: Service) => (
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
                            <span>{formatCurrency(calculatedItem.internal_cost, "USD")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Client Price:</span>
                            <span className="font-medium">
                              {formatCurrency(calculatedItem.client_price, "USD")}
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
            <CardDescription>Calculated totals</CardDescription>
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
                      {formatCurrency(calculatedQuote.total_internal_cost, "USD")}
                    </span>
                  </div>
                  {calculatedQuote.revisions_cost && calculatedQuote.revisions_cost > 0 && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Additional Revisions Cost:</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedQuote.revisions_cost, "USD")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Total Client Price:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(calculatedQuote.total_client_price, "USD")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Margin:</span>
                    <span className="font-medium">
                      {(targetMargin * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual Margin:</span>
                    <span
                      className={`text-xl font-bold ${
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
                    placeholder="Add notes about this quote..."
                    rows={4}
                  />
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Revisions</label>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Revisions Included</label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={revisionsIncluded}
                          onChange={(e) => setRevisionsIncluded(parseInt(e.target.value) || 2)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Number of revisions included in the base quote price
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          Cost per Additional Revision (optional)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={revisionCostPerAdditional ?? ""}
                          onChange={(e) => 
                            setRevisionCostPerAdditional(
                              e.target.value === "" ? undefined : parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Leave empty for no additional cost"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Cost for each revision beyond the included count
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newVersion"
                      checked={createNewVersion}
                      onChange={(e) => setCreateNewVersion(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="newVersion" className="text-sm">
                      Create new version instead of updating current
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={
                      updateQuoteMutation.isPending ||
                      createVersionMutation.isPending ||
                      quoteItems.length === 0
                    }
                  >
                    {updateQuoteMutation.isPending || createVersionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : createNewVersion ? (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Create New Version
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
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

        {/* Expenses Section (Sprint 15) */}
        <ExpensesSection 
          projectId={projectId} 
          quoteId={quoteId} 
          currency={(project as any)?.currency || "USD"}
          onExpensesChange={setExpenses}
        />
      </div>

      {/* Send Email Dialog */}
      {quote && project ? (
        <SendEmailDialog
          open={sendEmailDialogOpen}
          onOpenChange={setSendEmailDialogOpen}
          projectId={projectId}
          quoteId={quoteId}
          projectName={(project as any).name || ""}
          clientEmail={(project as any).client_email || ""}
          quoteVersion={Number((quote as any).version) || 1}
        />
      ) : null}
    </div>
  )
}

