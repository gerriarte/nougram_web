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
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useGetProject, useGetTaxes, useUpdateProject } from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"
import { SUPPORTED_CURRENCIES } from "@/lib/currency"
import { usePrimaryCurrency } from "@/hooks/usePrimaryCurrency"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = parseInt(params.id as string)
  const { toast } = useToast()

  const { data: project, isLoading: projectLoading } = useGetProject(projectId)
  const updateProjectMutation = useUpdateProject()

  const primaryCurrency = usePrimaryCurrency() // Moneda primaria de la organización
  const [projectName, setProjectName] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [status, setStatus] = useState("")
  const [currency, setCurrency] = useState(primaryCurrency) // Inicializar con moneda primaria
  const [selectedTaxIds, setSelectedTaxIds] = useState<number[]>([])

  const { data: taxesData } = useGetTaxes(undefined, true)
  const taxes = (taxesData?.items && Array.isArray(taxesData.items)) ? taxesData.items : []

  // Load project data when available
  useEffect(() => {
    if (project) {
      setProjectName((project as any).name || "")
      setClientName((project as any).client_name || "")
      setClientEmail((project as any).client_email || "")
      setStatus((project as any).status || "Draft")
      // Usar moneda del proyecto si existe, sino usar moneda primaria
      setCurrency((project as any).currency || primaryCurrency)
      setSelectedTaxIds((project as any).tax_ids || [])
    }
  }, [project, primaryCurrency])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectName.trim() || !clientName.trim()) {
      toast({
        title: "Error",
        description: "Project name and client name are required",
        variant: "destructive",
      })
      return
    }

    try {
      await updateProjectMutation.mutateAsync({
        id: projectId,
        data: {
          name: projectName.trim(),
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          status: status,
          currency: currency,
          tax_ids: selectedTaxIds,
        },
      })

      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      router.push(`/projects/${projectId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update project"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push("/projects")}>
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

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Update project and client details</CardDescription>
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
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="clientName" className="text-sm font-medium mb-2 block">
                  Client Name *
                </label>
                <Input
                  id="clientName"
                  placeholder="e.g. Acme Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="text-sm font-medium mb-2 block">
                  Status *
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
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
                        {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Taxes (Optional)
              </label>
              <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                {taxes.length === 0 ? (
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

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={updateProjectMutation.isPending}
                className="flex-1"
              >
                {updateProjectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}`)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

