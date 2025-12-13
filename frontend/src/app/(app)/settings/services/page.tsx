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
import { Plus, Pencil, Trash2, Loader2, Package, Trash } from "lucide-react"
import {
  useGetServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/lib/queries"
import { ServiceForm } from "@/components/services/service-form"
import { formatPercentage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { MESSAGES } from "@/lib/messages"

interface Service {
  id: number
  name: string
  description?: string
  default_margin_target: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ServicesSettingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetServices()
  const createMutation = useCreateService()
  const updateMutation = useUpdateService()
  const deleteMutation = useDeleteService()

  const services = data?.items || []

  const handleCreate = async (formData: {
    name: string
    description?: string
    default_margin_target: number
    is_active: boolean
  }) => {
    try {
      // Clean description: send null if empty string, otherwise send the trimmed value
      const cleanedData: any = {
        name: formData.name.trim(),
        default_margin_target: formData.default_margin_target,
        is_active: formData.is_active,
      }
      
      // Only include description if it has a value
      if (formData.description && formData.description.trim()) {
        cleanedData.description = formData.description.trim()
      }
      
      await createMutation.mutateAsync(cleanedData)
      
      toast({
        title: "Success",
        description: MESSAGES.success.serviceCreated,
      })
      
      setIsFormOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.error.serviceCreate
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      // Don't close the form on error so user can fix it
    }
  }

  const handleUpdate = async (formData: {
    name: string
    description?: string
    default_margin_target: number
    is_active: boolean
  }) => {
    if (editingService) {
      try {
        // Clean description: only include if it has a value
        const cleanedData: any = {
          name: formData.name.trim(),
          default_margin_target: formData.default_margin_target,
          is_active: formData.is_active,
        }
        
        // Only include description if it has a value
        if (formData.description && formData.description.trim()) {
          cleanedData.description = formData.description.trim()
        }
        
        await updateMutation.mutateAsync({ id: editingService.id, data: cleanedData })
        
        toast({
          title: "Success",
          description: MESSAGES.success.serviceUpdated,
        })
        
        setEditingService(null)
        setIsFormOpen(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : MESSAGES.error.serviceUpdate
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        // Don't close the form on error so user can fix it
      }
    }
  }

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      try {
        await deleteMutation.mutateAsync(serviceToDelete.id)
        toast({
          title: "Success",
          description: MESSAGES.success.serviceDeleted,
        })
        setServiceToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : MESSAGES.error.serviceDelete
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const activeServices = services.filter((s: Service) => s.is_active).length
  const inactiveServices = services.length - activeServices

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services Catalog</h1>
          <p className="text-muted-foreground">Manage your agency's service offerings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/settings/services/trash'}
          >
            <Trash className="h-4 w-4 mr-2" />
            Papelera
          </Button>
          <Button onClick={() => setIsFormOpen(true)} disabled={createMutation.isPending || updateMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Services in catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeServices}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inactive Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{inactiveServices}</div>
            <p className="text-xs text-muted-foreground mt-1">Not available for quotes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
          <CardDescription>
            {services.length} service{services.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-8">
              Error al cargar servicios: {String(error)}
            </p>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                {MESSAGES.empty.noServices}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Margin Target</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service: Service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.description || <span className="italic">No description</span>}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPercentage(service.default_margin_target)}
                    </TableCell>
                    <TableCell className="text-center">
                      {service.is_active ? (
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(service)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending && serviceToDelete?.id === service.id ? (
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

      <ServiceForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingService(null)
          }
        }}
        onSubmit={editingService ? handleUpdate : handleCreate}
          defaultValues={editingService || undefined}
          mode={editingService ? "edit" : "create"}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        description={MESSAGES.confirm.deleteService}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
