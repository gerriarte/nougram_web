"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Users } from "lucide-react"
import { usePrimaryCurrency } from "@/hooks/usePrimaryCurrency"
import { useEffect } from "react"

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
  const primaryCurrency = usePrimaryCurrency() // Moneda primaria de la organización
  
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
      currency: (primaryCurrency || "USD") as "USD" | "COP" | "EUR" | "ARS", // Usar moneda primaria por defecto
      billable_hours_per_week: 40,
    },
  })
  
  // Actualizar currency cuando cambie la moneda primaria (solo si no hay defaultValues)
  useEffect(() => {
    if (!defaultValues && mode === "create") {
      setValue("currency", (primaryCurrency || "USD") as "USD" | "COP" | "EUR" | "ARS")
    }
  }, [primaryCurrency, defaultValues, mode, setValue])

  const handleFormSubmit = async (data: TeamMemberFormData) => {
    await onSubmit(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-grey-900">
                {mode === "create" ? "Add Team Member" : "Edit Team Member"}
              </DialogTitle>
              <DialogDescription className="text-grey-600 text-sm mt-1">
                {mode === "create"
                  ? "Add a new team member to the agency."
                  : "Update the team member details."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-grey-700 font-medium">
              Name <span className="text-error-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., John Doe"
              className="h-10 bg-white border-grey-300 focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.name && (
              <p className="text-sm text-error-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-grey-700 font-medium">
              Role <span className="text-error-500">*</span>
            </Label>
            <Input
              id="role"
              {...register("role")}
              placeholder="e.g., Senior Developer, Designer"
              className="h-10 bg-white border-grey-300 focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.role && (
              <p className="text-sm text-error-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_monthly_brute" className="text-grey-700 font-medium">
                Monthly Salary (Gross) <span className="text-error-500">*</span>
              </Label>
              <Input
                id="salary_monthly_brute"
                type="number"
                step="0.01"
                {...register("salary_monthly_brute", { valueAsNumber: true })}
                placeholder="0.00"
                className="h-10 bg-white border-grey-300 focus:border-primary-500 focus:ring-primary-500"
              />
              {errors.salary_monthly_brute && (
                <p className="text-sm text-error-500 mt-1">{errors.salary_monthly_brute.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-grey-700 font-medium">
                Currency <span className="text-error-500">*</span>
              </Label>
              <Select
                value={watch("currency")}
                onValueChange={(value) => setValue("currency", value as "USD" | "COP" | "ARS" | "EUR")}
              >
                <SelectTrigger className="h-10 bg-white border-grey-300 focus:border-primary-500 focus:ring-primary-500">
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
                <p className="text-sm text-error-500 mt-1">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billable_hours_per_week" className="text-grey-700 font-medium">
              Billable Hours per Week <span className="text-error-500">*</span>
            </Label>
            <Input
              id="billable_hours_per_week"
              type="number"
              step="0.1"
              min="1"
              max="80"
              {...register("billable_hours_per_week", { valueAsNumber: true })}
              placeholder="40"
              className="h-10 bg-white border-grey-300 focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="text-xs text-grey-500 mt-1">
              Typical range: 32-40 hours per week
            </p>
            {errors.billable_hours_per_week && (
              <p className="text-sm text-error-500 mt-1">
                {errors.billable_hours_per_week.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-grey-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              className="border-grey-300 text-grey-700 hover:bg-grey-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary-500 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Loading...</span>
                </>
              ) : (
                mode === "create" ? "Add Member" : "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

