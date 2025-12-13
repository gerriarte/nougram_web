"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatPercentage } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { MESSAGES } from "@/lib/messages"
import { logger } from "@/lib/logger"

const serviceSchema = z.object({
  name: z.string().min(1, MESSAGES.validation.nameRequired),
  description: z.string().optional().or(z.literal("")),
  default_margin_target: z.number().min(0, MESSAGES.validation.marginRange).max(1, MESSAGES.validation.marginRange),
  is_active: z.boolean().default(true),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ServiceFormData) => void
  defaultValues?: Partial<ServiceFormData>
  mode?: "create" | "edit"
}

export function ServiceForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = "create",
}: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      default_margin_target: 0.40,
      is_active: true,
    },
  })

  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      // Clean description: convert empty string to undefined
      const cleanedData = {
        ...data,
        description: data.description?.trim() || undefined,
      }
      logger.debug("ServiceForm submitting data:", cleanedData)
      await onSubmit(cleanedData)
      // Only reset and close if onSubmit succeeds
      reset()
      onOpenChange(false)
    } catch (error) {
      // Error is handled in parent component
      logger.error("Form submission error:", error)
      // Don't reset or close on error
    }
  }

  const marginValue = watch("default_margin_target") || 0
  const marginPercent = (marginValue * 100).toFixed(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Service" : "Edit Service"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new service to the catalog."
              : "Update the service details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Service Name *
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Web Development, Branding, Consulting"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Brief description of the service"
              className="mt-1"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="default_margin_target" className="text-sm font-medium">
              Default Profit Margin Target
            </label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  id="default_margin_target"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("default_margin_target", { valueAsNumber: true })}
                  placeholder="0.40"
                  className="mt-1"
                />
                {errors.default_margin_target && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.default_margin_target.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                  <span className="font-semibold">{marginPercent}%</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    This margin will be used by default when creating quotes for this service.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a value between 0 and 1 (e.g., 0.40 = 40% margin)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active", { valueAsBoolean: true })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Active Service
            </label>
            <p className="text-xs text-muted-foreground ml-2">
              Only active services will appear in project quotes
            </p>
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
                mode === "create" ? MESSAGES.buttons.addService : MESSAGES.buttons.saveChanges
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

