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
import { Loader2 } from "lucide-react"
import { MESSAGES } from "@/lib/messages"

const costSchema = z.object({
  name: z.string().min(1, MESSAGES.validation.nameRequired),
  amount_monthly: z.number().min(0, MESSAGES.validation.amountPositive),
  currency: z.enum(["USD", "COP", "ARS", "EUR"], {
    errorMap: () => ({ message: MESSAGES.validation.currencyInvalid }),
  }),
  category: z.string().min(1, MESSAGES.validation.categoryRequired),
})

type CostFormData = z.infer<typeof costSchema>

interface CostFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CostFormData) => void
  defaultValues?: Partial<CostFormData>
  mode?: "create" | "edit"
}

export function CostForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = "create",
}: CostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CostFormData>({
    resolver: zodResolver(costSchema),
    defaultValues: defaultValues || {
      name: "",
      amount_monthly: 0,
      currency: "USD",
      category: "general",
    },
  })

  const handleFormSubmit = async (data: CostFormData) => {
    await onSubmit(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Fixed Cost" : "Edit Fixed Cost"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new fixed monthly cost to the agency."
              : "Update the fixed monthly cost details."}
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
              placeholder="e.g., Office Rent"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount_monthly" className="text-sm font-medium">
                Monthly Amount
              </label>
              <Input
                id="amount_monthly"
                type="number"
                step="0.01"
                {...register("amount_monthly", { valueAsNumber: true })}
                placeholder="0.00"
                className="mt-1"
              />
              {errors.amount_monthly && (
                <p className="text-sm text-destructive mt-1">{errors.amount_monthly.message}</p>
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
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="category"
              {...register("category")}
              placeholder="e.g., office, software, marketing"
              className="mt-1"
            />
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? MESSAGES.loading.creating : MESSAGES.loading.updating}
                </>
              ) : (
                mode === "create" ? "Add Cost" : "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

