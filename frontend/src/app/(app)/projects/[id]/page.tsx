"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Pencil, Plus, Loader2, Package, Download, Mail, FileText, TrendingUp } from "lucide-react"
import { useGetProject, useGetProjectQuotes, useGetCurrentUser } from "@/lib/queries"
import { formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { downloadPDF, downloadDOCX } from "@/lib/api-client"
import { SendEmailDialog } from "@/components/quotes/send-email-dialog"
import { useToast } from "@/hooks/use-toast"
import { canSendQuotes } from "@/lib/permissions"
import { RentabilitySummary } from "@/components/quotes/RentabilitySummary"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = parseInt(params.id as string)

  const { data: project, isLoading: projectLoading } = useGetProject(projectId)
  const { data: quotes, isLoading: quotesLoading } = useGetProjectQuotes(projectId)
  const { data: currentUser } = useGetCurrentUser()
  const canSendQuotesPermission = canSendQuotes(currentUser)
  const { toast } = useToast()
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false)
  const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null)

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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Won":
        return "default" as const
      case "Sent":
        return "secondary" as const
      case "Lost":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{(project as any).name || ""}</h1>
            <p className="text-muted-foreground">{(project as any).client_name || ""}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/projects/${projectId}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusBadgeVariant((project as any).status || "Draft")}>
              {(project as any).status || "Draft"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{(project as any).currency || "USD"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {(project as any).created_at ? new Date((project as any).created_at).toLocaleDateString() : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quote Versions</CardTitle>
              <CardDescription>
                {quotesLoading ? "Loading..." : `${quotes?.length || 0} version${quotes?.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            <Button onClick={() => router.push(`/projects/${projectId}/quotes/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              New Version
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !quotes || quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-4">
                No quotes yet. Create the first version.
              </p>
              <Button onClick={() => router.push(`/projects/${projectId}/quotes/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Quote
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Internal Cost</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Análisis</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote: any) => (
                    <React.Fragment key={quote.id}>
                      <TableRow className={expandedQuoteId === quote.id ? "bg-grey-50" : ""}>
                        <TableCell className="font-medium">v{quote.version}</TableCell>
                        <TableCell>{formatCurrency(quote.total_client_price || 0, (project as any).currency || "USD")}</TableCell>
                        <TableCell>{formatCurrency(quote.total_internal_cost || 0, (project as any).currency || "USD")}</TableCell>
                        <TableCell>
                          <span className={quote.margin_percentage && quote.margin_percentage < 0.20 ? "text-destructive" : ""}>
                            {((quote.margin_percentage || 0) * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(quote as any).created_at ? new Date((quote as any).created_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={expandedQuoteId === quote.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}
                            className={expandedQuoteId === quote.id ? "" : "text-grey-600 border-grey-300"}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Ver Rentabilidad
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* ... actions ... */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const safeProjectName = (project as any)?.name?.replace(/[^a-z0-9]/gi, '_') || 'project'
                                  const filename = `cotizacion_${safeProjectName}_v${quote.version}.pdf`
                                  await downloadPDF(`/projects/${projectId}/quotes/${quote.id}/pdf`, filename)
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
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const safeProjectName = (project as any)?.name?.replace(/[^a-z0-9]/gi, '_') || 'project'
                                  const filename = `cotizacion_${safeProjectName}_v${quote.version}.docx`
                                  await downloadDOCX(`/projects/${projectId}/quotes/${quote.id}/docx`, filename)
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
                              <FileText className="h-4 w-4 mr-1" />
                              DOCX
                            </Button>
                            {canSendQuotesPermission && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedQuote(quote)
                                  setSendEmailDialogOpen(true)
                                }}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/projects/${projectId}/quotes/${quote.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedQuoteId === quote.id && (
                        <TableRow className="bg-grey-50/30 hover:bg-grey-50/30">
                          <TableCell colSpan={7} className="p-8 border-b-2 border-grey-100">
                            <div className="bg-white rounded-2xl shadow-sm border border-grey-200 p-6">
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-grey-900 flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-blue-600" />
                                  Análisis de Rentabilidad - v{quote.version}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedQuoteId(null)}
                                  className="text-grey-400 hover:text-grey-600"
                                >
                                  Cerrar Análisis
                                </Button>
                              </div>
                              <RentabilitySummary quoteId={quote.id} currency={(project as any).currency || "USD"} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Email Dialog */}
      {selectedQuote && project && (
        <SendEmailDialog
          open={sendEmailDialogOpen}
          onOpenChange={(open) => {
            setSendEmailDialogOpen(open)
            if (!open) setSelectedQuote(null)
          }}
          projectId={projectId}
          quoteId={selectedQuote.id}
          projectName={(project as any).name || ""}
          clientEmail={(project as any).client_email || ""}
          quoteVersion={selectedQuote.version}
        />
      )}
    </div>
  )
}
