"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const taxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  percentage: z.number().min(0, "Percentage must be 0 or greater").max(100, "Percentage cannot exceed 100"),
  country: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

type TaxFormValues = z.infer<typeof taxSchema>

interface TaxFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: unknown) => Promise<void>
  defaultValues?: {
    id?: number
    name?: string
    code?: string
    percentage?: number
    country?: string
    description?: string
    is_active?: boolean
  }
  mode?: "create" | "edit"
}

const COUNTRIES = [
  { code: "CO", name: "Colombia" },
  { code: "AR", name: "Argentina" },
  { code: "US", name: "United States" },
  { code: "MX", name: "Mexico" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "BR", name: "Brazil" },
  { code: "ES", name: "Spain" },
]

export function TaxForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = "create",
}: TaxFormProps) {
  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      percentage: defaultValues?.percentage || 0,
      country: defaultValues?.country || undefined,
      description: defaultValues?.description || undefined,
      is_active: defaultValues?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || "",
        code: defaultValues.code || "",
        percentage: defaultValues.percentage || 0,
        country: defaultValues.country || undefined,
        description: defaultValues.description || undefined,
        is_active: defaultValues.is_active ?? true,
      })
    } else {
      form.reset({
        name: "",
        code: "",
        percentage: 0,
        country: undefined,
        description: undefined,
        is_active: true,
      })
    }
  }, [defaultValues, form])

  const handleSubmit = async (values: TaxFormValues) => {
    // Clean up empty strings for optional fields
    const cleanedValues = {
      ...values,
      country: values.country && values.country.trim() ? values.country.trim() : undefined,
      description: values.description && values.description.trim() ? values.description.trim() : undefined,
    }
    await onSubmit(cleanedValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Tax" : "Create Tax"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update tax information"
              : "Add a new tax that can be applied to projects"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IVA, Transaction Cost" {...field} />
                  </FormControl>
                  <FormDescription>The display name of the tax</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IVA_CO, TX_AR" {...field} />
                  </FormControl>
                  <FormDescription>Unique code identifier (e.g., IVA_CO for Colombia IVA)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="19.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Tax percentage (e.g., 19 for 19%)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value || undefined)} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Country where this tax applies</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Only active taxes can be applied to projects
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{mode === "edit" ? "Update" : "Create"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

