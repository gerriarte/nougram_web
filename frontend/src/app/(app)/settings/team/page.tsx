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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import {
  useGetTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useGetCurrentUser,
  useGetOrganizationStats,
} from "@/lib/queries"
import { TeamMemberForm } from "@/components/team/team-member-form"
import { BlendedCostRate } from "@/components/costs/blended-cost-rate"
import { formatCurrency } from "@/lib/currency"
import { LimitIndicator, canCreateResource } from "@/components/organization/LimitIndicator"

interface TeamMember {
  id: number
  name: string
  role: string
  salary_monthly_brute: number
  currency?: string
  billable_hours_per_week: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function TeamSettingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const { data: currentUser } = useGetCurrentUser()
  const organizationId = currentUser?.organization_id
  const { data: orgStats } = useGetOrganizationStats(organizationId ?? 0)
  const { data, isLoading, error } = useGetTeamMembers()
  const createMutation = useCreateTeamMember()
  const updateMutation = useUpdateTeamMember()
  const deleteMutation = useDeleteTeamMember()

  const members = (data?.items && Array.isArray(data.items)) ? data.items : []
  const canCreateTeamMember = orgStats 
    ? canCreateResource(orgStats.current_usage.team_members, orgStats.limits.team_members)
    : true

  const handleCreate = async (formData: {
    name: string
    role: string
    salary_monthly_brute: number
    currency: string
    billable_hours_per_week: number
  }) => {
    await createMutation.mutateAsync(formData)
    setIsFormOpen(false)
  }

  const handleUpdate = async (formData: {
    name: string
    role: string
    salary_monthly_brute: number
    currency: string
    billable_hours_per_week: number
  }) => {
    if (editingMember) {
      await updateMutation.mutateAsync({ id: editingMember.id, data: formData })
      setEditingMember(null)
      setIsFormOpen(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este miembro del equipo?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setIsFormOpen(true)
  }

  // Group salaries by currency
  const salariesByCurrency = members.reduce((acc, member) => {
    const currency = member.currency || "USD"
    if (!acc[currency]) {
      acc[currency] = 0
    }
    acc[currency] += member.salary_monthly_brute
    return acc
  }, {} as Record<string, number>)
  
  const totalHours = members.reduce((sum, member) => sum + member.billable_hours_per_week * 4.33, 0)
  
  // Get primary currency (most used) or first one
  const primaryCurrency = Object.keys(salariesByCurrency).length > 0 
    ? Object.keys(salariesByCurrency).reduce((a, b) => 
        salariesByCurrency[a] > salariesByCurrency[b] ? a : b
      )
    : "USD"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Miembros del Equipo</h1>
          <p className="text-muted-foreground">Gestiona los miembros del equipo de tu agencia</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} disabled={!canCreateTeamMember}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Miembro
        </Button>
      </div>

      {orgStats && (
        <LimitIndicator
          current={orgStats.current_usage.team_members}
          limit={orgStats.limits.team_members}
          resourceName="Miembros del Equipo"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Miembros del Equipo</CardTitle>
              <CardDescription>
                {members.length} miembro{members.length !== 1 ? "s" : ""} configurado{members.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <p className="text-sm text-destructive text-center py-8">
                  Error al cargar el equipo: {String(error)}
                </p>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aún no hay miembros del equipo configurados. Haz clic en "Agregar Miembro" para comenzar.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right">Salario Mensual</TableHead>
                      <TableHead className="text-right">Horas/Semana</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(member.salary_monthly_brute, member.currency || "USD")}
                        </TableCell>
                        <TableCell className="text-right">{member.billable_hours_per_week}h</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right">
                        {Object.keys(salariesByCurrency).length > 1 ? (
                          <div className="space-y-1">
                            {Object.entries(salariesByCurrency).map(([currency, amount]) => (
                              <div key={currency}>
                                {formatCurrency(amount, currency)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          formatCurrency(salariesByCurrency[primaryCurrency] || 0, primaryCurrency)
                        )}
                      </TableCell>
                      <TableCell className="text-right">{totalHours.toFixed(1)}h/month</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <BlendedCostRate />
        </div>
      </div>

      <TeamMemberForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingMember(null)
          }
        }}
        onSubmit={editingMember ? handleUpdate : handleCreate}
        defaultValues={editingMember || undefined}
        mode={editingMember ? "edit" : "create"}
      />
    </div>
  )
}
