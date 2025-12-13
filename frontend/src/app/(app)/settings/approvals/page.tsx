"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, Eye } from "lucide-react"
import {
  useGetDeleteRequests,
  useApproveDeleteRequest,
  useRejectDeleteRequest,
  DeleteRequest,
} from "@/lib/queries"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const resourceTypeLabels: Record<string, string> = {
  cost: "Costo",
  service: "Servicio",
  tax: "Impuesto",
  project: "Proyecto",
  quote: "Cotización",
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
}

const statusColors: Record<string, string> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
}

export default function ApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined)
  const [selectedRequest, setSelectedRequest] = useState<DeleteRequest | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  
  const { data, isLoading, error } = useGetDeleteRequests(statusFilter)
  const approveMutation = useApproveDeleteRequest()
  const rejectMutation = useRejectDeleteRequest()
  const { toast } = useToast()

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      await approveMutation.mutateAsync({
        requestId: selectedRequest.id,
      })
      toast({
        title: "Solicitud aprobada",
        description: "La eliminación ha sido aprobada y ejecutada.",
      })
      setApproveDialogOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo aprobar la solicitud",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      await rejectMutation.mutateAsync({
        requestId: selectedRequest.id,
        reason: rejectionReason || undefined,
      })
      toast({
        title: "Solicitud rechazada",
        description: "La solicitud de eliminación ha sido rechazada.",
      })
      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo rechazar la solicitud",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Error al cargar solicitudes"}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const requests = data?.items || []
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Panel de Aprobaciones</CardTitle>
              <CardDescription>
                Gestiona las solicitudes de eliminación pendientes de aprobación
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                </Badge>
              )}
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Solicitado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay solicitudes {statusFilter ? `con estado "${statusLabels[statusFilter]}"` : ''}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request: DeleteRequest) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {resourceTypeLabels[request.resource_type] || request.resource_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{request.resource_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.requested_by_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.requested_by_email || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(request.requested_at)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[request.status] as any}>
                        {statusLabels[request.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedRequest(request)
                              setApproveDialogOpen(true)
                            }}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request)
                              setRejectDialogOpen(true)
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {request.status === 'approved' && request.approved_by_name && (
                            <div>
                              Aprobado por: {request.approved_by_name}
                              {request.approved_at && (
                                <div className="text-xs">{formatDate(request.approved_at)}</div>
                              )}
                            </div>
                          )}
                          {request.status === 'rejected' && request.rejection_reason && (
                            <div className="max-w-xs">
                              <div className="font-medium">Razón:</div>
                              <div className="text-xs">{request.rejection_reason}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Aprobar eliminación?</DialogTitle>
            <DialogDescription>
              Estás a punto de aprobar la eliminación de {selectedRequest && resourceTypeLabels[selectedRequest.resource_type]} con ID {selectedRequest?.resource_id}.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Rechazar solicitud?</DialogTitle>
            <DialogDescription>
              Estás a punto de rechazar la solicitud de eliminación de {selectedRequest && resourceTypeLabels[selectedRequest.resource_type]} con ID {selectedRequest?.resource_id}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Razón del rechazo (opcional)</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué se rechaza esta solicitud..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false)
              setRejectionReason("")
            }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

