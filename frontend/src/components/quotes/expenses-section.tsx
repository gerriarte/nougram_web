"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { useGetQuoteExpenses, useCreateQuoteExpense, useUpdateQuoteExpense, useDeleteQuoteExpense, type QuoteExpense, type QuoteExpenseCreate } from "@/lib/queries"
import { formatCurrency } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
// ESTÁNDAR NOUGRAM: Usar dinero.js para cálculos precisos
import { fromAPI, multiplyMoney, sumMoney, toAPI, formatCurrency as formatDinero } from "@/lib/money"
import type { Dinero } from 'dinero.js'
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ExpensesSectionProps {
  projectId: number
  quoteId: number
  currency: string
  onExpensesChange?: (expenses: QuoteExpense[]) => void
}

export function ExpensesSection({ projectId, quoteId, currency, onExpensesChange }: ExpensesSectionProps) {
  const { toast } = useToast()
  const { data: expenses = [], isLoading } = useGetQuoteExpenses(projectId, quoteId)
  const createExpenseMutation = useCreateQuoteExpense()
  const updateExpenseMutation = useUpdateQuoteExpense()
  const deleteExpenseMutation = useDeleteQuoteExpense()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<QuoteExpense | null>(null)
  const [formData, setFormData] = useState<QuoteExpenseCreate>({
    name: "",
    description: "",
    cost: 0,
    markup_percentage: 0,
    category: "Third Party",
    quantity: 1,
  })

  // Notify parent when expenses change
  if (onExpensesChange && expenses) {
    onExpensesChange(expenses)
  }

  const handleOpenDialog = (expense?: QuoteExpense) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData({
        name: expense.name,
        description: expense.description || "",
        cost: expense.cost,
        markup_percentage: expense.markup_percentage,
        category: expense.category || "Third Party",
        quantity: expense.quantity,
      })
    } else {
      setEditingExpense(null)
      setFormData({
        name: "",
        description: "",
        cost: 0,
        markup_percentage: 0,
        category: "Third Party",
        quantity: 1,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
    setFormData({
      name: "",
      description: "",
      cost: 0,
      markup_percentage: 0,
      category: "Third Party",
      quantity: 1,
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || formData.cost <= 0) {
      toast({
        title: "Error",
        description: "Name and cost are required",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({
          projectId,
          quoteId,
          expenseId: editingExpense.id,
          data: formData,
        })
        toast({
          title: "Success",
          description: "Expense updated successfully",
        })
      } else {
        await createExpenseMutation.mutateAsync({
          projectId,
          quoteId,
          data: formData,
        })
        toast({
          title: "Success",
          description: "Expense added successfully",
        })
      }
      handleCloseDialog()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save expense",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (expenseId: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return
    }

    try {
      await deleteExpenseMutation.mutateAsync({
        projectId,
        quoteId,
        expenseId,
      })
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  // ESTÁNDAR NOUGRAM: Calcular precio cliente usando dinero.js
  const calculateClientPrice = (cost: number, markup: number, quantity: number): number => {
    const costMoney = fromAPI(cost, currency)
    const quantityMoney = multiplyMoney(costMoney, quantity)
    const markupMultiplier = 1 + markup
    const clientPriceMoney = multiplyMoney(quantityMoney, markupMultiplier)
    return toAPI(clientPriceMoney)
  }

  // ESTÁNDAR NOUGRAM: Calcular totales usando dinero.js
  const totalExpensesCostMoney: Dinero[] = expenses.map(exp => {
    const costMoney = fromAPI(exp.cost, currency)
    return multiplyMoney(costMoney, exp.quantity)
  })
  const totalExpensesCost = toAPI(sumMoney(totalExpensesCostMoney) || fromAPI(0, currency))

  const totalExpensesClientPriceMoney: Dinero[] = expenses.map(exp => {
    // Los expenses ya vienen del API con client_price calculado, pero lo convertimos a Dinero
    return fromAPI(exp.client_price, currency)
  })
  const totalExpensesClientPrice = toAPI(sumMoney(totalExpensesClientPriceMoney) || fromAPI(0, currency))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Third-Party Expenses</CardTitle>
            <CardDescription>Add third-party costs with markup (licenses, materials, etc.)</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
                <DialogDescription>
                  Add a third-party cost with markup percentage
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="expense-name">Name *</Label>
                  <Input
                    id="expense-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Stock License"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-description">Description</Label>
                  <Textarea
                    id="expense-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expense-cost">Cost *</Label>
                    <Input
                      id="expense-cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-quantity">Quantity</Label>
                    <Input
                      id="expense-quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expense-markup">Markup %</Label>
                    <Input
                      id="expense-markup"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.markup_percentage * 100}
                      onChange={(e) => setFormData({ ...formData, markup_percentage: (parseFloat(e.target.value) || 0) / 100 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Third Party">Third Party</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Licenses">Licenses</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.cost > 0 && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground">Client Price:</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(calculateClientPrice(formData.cost, formData.markup_percentage, formData.quantity || 1), currency)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}>
                  {editingExpense ? "Update" : "Add"} Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses added yet</p>
            <p className="text-sm mt-2">Click "Add Expense" to add third-party costs</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Markup</TableHead>
                    <TableHead className="text-right">Client Price</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.name}</TableCell>
                      <TableCell>{expense.category || "-"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.cost, currency)}</TableCell>
                      <TableCell className="text-right">{expense.quantity}</TableCell>
                      <TableCell className="text-right">{(expense.markup_percentage * 100).toFixed(1)}%</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(expense.client_price, currency)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(expense)}
                            disabled={deleteExpenseMutation.isPending}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deleteExpenseMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Expenses Cost:</span>
                <span className="font-medium">{formatCurrency(totalExpensesCost, currency)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Total Expenses (with markup):</span>
                <span className="font-semibold">{formatCurrency(totalExpensesClientPrice, currency)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}






