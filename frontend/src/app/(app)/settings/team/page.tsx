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
} from "@/lib/queries"
import { TeamMemberForm } from "@/components/team/team-member-form"
import { BlendedCostRate } from "@/components/costs/blended-cost-rate"
import { formatCurrency } from "@/lib/currency"

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

  const { data, isLoading, error } = useGetTeamMembers()
  const createMutation = useCreateTeamMember()
  const updateMutation = useUpdateTeamMember()
  const deleteMutation = useDeleteTeamMember()

  const members = data?.items || []

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
    if (confirm("Are you sure you want to delete this team member?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setIsFormOpen(true)
  }

  const totalSalaries = members.reduce((sum, member) => sum + member.salary_monthly_brute, 0)
  const totalHours = members.reduce((sum, member) => sum + member.billable_hours_per_week * 4.33, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your agency's team members</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Members List</CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? "s" : ""} configured
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
                  No team members configured yet. Click "Add Member" to get started.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Monthly Salary</TableHead>
                      <TableHead className="text-right">Hours/Week</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(member.salary_monthly_brute, "USD")}
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
                        {formatCurrency(totalSalaries, "USD")}
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
