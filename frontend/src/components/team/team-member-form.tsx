"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CURRENCIES } from "@/lib/currency"

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  salary_monthly_brute: z.number().min(0, "Salary must be positive"),
  currency: z.enum(["USD", "COP", "ARS", "EUR"], {
    errorMap: () => ({ message: "Please select a valid currency" }),
  }),
  billable_hours_per_week: z.number().min(1).max(80, "Hours must be between 1 and 80"),
})

type TeamMemberFormData = z.infer<typeof teamMemberSchema>

interface TeamMemberFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TeamMemberFormData) => void
  defaultValues?: Partial<TeamMemberFormData>
  mode?: "create" | "edit"
}

export function TeamMemberForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = "create",
}: TeamMemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: defaultValues || {
      name: "",
      role: "",
      salary_monthly_brute: 0,
      currency: "USD",
      billable_hours_per_week: 40,
    },
  })

  const handleFormSubmit = async (data: TeamMemberFormData) => {
    await onSubmit(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Team Member" : "Edit Team Member"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new team member to the agency."
              : "Update the team member details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., John Doe"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Input
              id="role"
              {...register("role")}
              placeholder="e.g., Senior Developer, Designer"
              className="mt-1"
            />
            {errors.role && (
              <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="salary_monthly_brute" className="text-sm font-medium">
                Monthly Salary (Gross)
              </label>
              <Input
                id="salary_monthly_brute"
                type="number"
                step="0.01"
                {...register("salary_monthly_brute", { valueAsNumber: true })}
                placeholder="0.00"
                className="mt-1"
              />
              {errors.salary_monthly_brute && (
                <p className="text-sm text-destructive mt-1">{errors.salary_monthly_brute.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="currency" className="text-sm font-medium">
                Currency
              </label>
              <Select
                value={watch("currency")}
                onValueChange={(value) => setValue("currency", value as "USD" | "COP" | "ARS" | "EUR")}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive mt-1">{errors.currency.message}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="billable_hours_per_week" className="text-sm font-medium">
              Billable Hours per Week
            </label>
            <Input
              id="billable_hours_per_week"
              type="number"
              step="0.1"
              {...register("billable_hours_per_week", { valueAsNumber: true })}
              placeholder="40"
              className="mt-1"
            />
            {errors.billable_hours_per_week && (
              <p className="text-sm text-destructive mt-1">
                {errors.billable_hours_per_week.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "create" ? "Add Member" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

