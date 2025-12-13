"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, Pencil, Trash2, Loader2, Package, Eye, Trash } from "lucide-react"
import {
  useGetProjects,
  useDeleteProject,
  useUpdateProject,
} from "@/lib/queries"
import { formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { MESSAGES } from "@/lib/messages"

interface Project {
  id: number
  name: string
  client_name: string
  client_email?: string
  status: string
  currency: string
  created_at: string
  updated_at?: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetProjects(statusFilter)
  const deleteMutation = useDeleteProject()
  const updateMutation = useUpdateProject()

  const projects = data?.items || []

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        await deleteMutation.mutateAsync(projectToDelete.id)
        toast({
          title: "Success",
          description: MESSAGES.success.projectDeleted,
        })
        setProjectToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : MESSAGES.error.projectDelete
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleStatusChange = async (projectId: number, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: projectId, data: { status: newStatus } })
      toast({
        title: "Success",
        description: MESSAGES.success.projectUpdated,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.error.projectUpdate
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
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

  const statusCounts = {
    all: projects.length,
    Draft: projects.filter((p: Project) => p.status === "Draft").length,
    Sent: projects.filter((p: Project) => p.status === "Sent").length,
    Won: projects.filter((p: Project) => p.status === "Won").length,
    Lost: projects.filter((p: Project) => p.status === "Lost").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects & Quotes</h1>
          <p className="text-muted-foreground">Manage your agency's projects and quotes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/projects/trash')}
          >
            <Trash className="h-4 w-4 mr-2" />
            Papelera
          </Button>
          <Button onClick={() => router.push("/projects/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setStatusFilter("")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.all}</div>
            <p className="text-xs text-muted-foreground mt-1">Total projects</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setStatusFilter("Draft")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{statusCounts.Draft}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setStatusFilter("Sent")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.Sent}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setStatusFilter("Won")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Won</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.Won}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setStatusFilter("Lost")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.Lost}</div>
            <p className="text-xs text-muted-foreground mt-1">Not accepted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects List</CardTitle>
          <CardDescription>
            {projects.length} project{projects.length !== 1 ? "s" : ""}
            {statusFilter && ` (${statusFilter} only)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-8">
              Error al cargar proyectos: {String(error)}
            </p>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                {MESSAGES.empty.noProjects}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            <div className="text-xs text-muted-foreground">{project.client_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 bg-transparent"
                          disabled={updateMutation.isPending}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </TableCell>
                      <TableCell>{project.currency}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/projects/${project.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/projects/${project.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(project)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && projectToDelete?.id === project.id ? (
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
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description={MESSAGES.confirm.deleteProject}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
