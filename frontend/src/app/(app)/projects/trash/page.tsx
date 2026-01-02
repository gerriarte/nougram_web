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
import { ArrowLeft, RotateCcw, Trash2, Loader2, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useGetDeletedProjects,
  useRestoreProject,
  usePermanentlyDeleteProject,
} from "@/lib/queries"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: number
  name: string
  client_name: string
  client_email?: string
  status: string
  currency: string
  deleted_at: string
  deleted_by_id?: number
  deleted_by_name?: string
  deleted_by_email?: string
  created_at: string
}

export default function ProjectsTrashPage() {
  const router = useRouter()
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [projectToRestore, setProjectToRestore] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetDeletedProjects()
  const restoreMutation = useRestoreProject()
  const permanentDeleteMutation = usePermanentlyDeleteProject()

  const projects = ((data as any)?.items && Array.isArray((data as any).items)) ? (data as any).items : []

  const handleRestoreClick = (project: Project) => {
    setProjectToRestore(project)
    setRestoreConfirmOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (projectToRestore) {
      try {
        await restoreMutation.mutateAsync(projectToRestore.id)
        toast({
          title: "Success",
          description: "Proyecto restaurado exitosamente",
        })
        setProjectToRestore(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al restaurar proyecto"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        await permanentDeleteMutation.mutateAsync(projectToDelete.id)
        toast({
          title: "Success",
          description: "Proyecto eliminado permanentemente",
        })
        setProjectToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al eliminar proyecto"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Draft: "secondary",
      Sent: "default",
      Won: "default",
      Lost: "destructive",
    }
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Papelera - Proyectos</h1>
            <p className="text-muted-foreground">Proyectos eliminados que pueden ser restaurados</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos Eliminados</CardTitle>
          <CardDescription>
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""} en papelera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="space-y-2 py-8">
              <p className="text-sm text-destructive text-center">
                Error loading deleted projects: {String(error)}
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                La papelera está vacía
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Eliminado por</TableHead>
                  <TableHead>Eliminado el</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project: Project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.client_name}</div>
                        {project.client_email && (
                          <div className="text-sm text-muted-foreground">{project.client_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{project.currency}</TableCell>
                    <TableCell className="text-sm">
                      {project.deleted_by_name ? (
                        <div>
                          <div className="font-medium">{project.deleted_by_name}</div>
                          {project.deleted_by_email && (
                            <div className="text-xs text-muted-foreground">{project.deleted_by_email}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(project.deleted_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestoreClick(project)}
                          disabled={restoreMutation.isPending}
                          title="Restaurar"
                        >
                          {restoreMutation.isPending && projectToRestore?.id === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(project)}
                          disabled={permanentDeleteMutation.isPending}
                          title="Eliminar permanentemente"
                        >
                          {permanentDeleteMutation.isPending && projectToDelete?.id === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={restoreConfirmOpen}
        onOpenChange={setRestoreConfirmOpen}
        onConfirm={handleRestoreConfirm}
        title="Restaurar Proyecto"
        description={`¿Estás seguro de que quieres restaurar "${projectToRestore?.name}"? El proyecto volverá a estar disponible.`}
        confirmText="Restaurar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Permanentemente"
        description={`¿Estás seguro de que quieres eliminar permanentemente "${projectToDelete?.name}"? Esta acción no se puede deshacer y eliminará todas las cotizaciones asociadas.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}

