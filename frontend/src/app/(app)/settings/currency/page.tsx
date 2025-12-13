"use client"

import { useState } from "react"
import { useGetCurrencySettings, useUpdateCurrencySettings } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { CURRENCIES } from "@/lib/currency"

export default function CurrencySettingsPage() {
  const { data, isLoading, error } = useGetCurrencySettings()
  const updateCurrency = useUpdateCurrencySettings()
  const [selectedCurrency, setSelectedCurrency] = useState<string>("")

  const handleSave = async () => {
    if (selectedCurrency) {
      await updateCurrency.mutateAsync({ primary_currency: selectedCurrency })
      setSelectedCurrency("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-destructive">Error loading currency settings</p>
        </CardContent>
      </Card>
    )
  }

  const currentCurrency = selectedCurrency || data?.primary_currency || "USD"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Currency Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure the primary currency for cost calculations and reporting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Primary Currency</CardTitle>
          <CardDescription>
            All costs will be normalized to this currency for calculations.
            Individual costs and salaries can be entered in different currencies
            and will be automatically converted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              Select Primary Currency
            </label>
            <Select
              value={currentCurrency}
              onValueChange={(value) => setSelectedCurrency(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data && (
            <div className="rounded-md bg-muted p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Configuration</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {data.currency_symbol} {data.primary_currency}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({data.primary_currency === "USD" ? "US Dollar" : 
                      data.primary_currency === "COP" ? "Colombian Peso" :
                      data.primary_currency === "ARS" ? "Argentine Peso" :
                      "Euro"})
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedCurrency("")}
              disabled={!selectedCurrency || updateCurrency.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedCurrency || currentCurrency === data?.primary_currency || updateCurrency.isPending}
            >
              {updateCurrency.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported Currencies</CardTitle>
          <CardDescription>
            These currencies are supported for entering costs and salaries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURRENCIES.map((currency) => (
              <div
                key={currency.code}
                className="rounded-md border p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold">{currency.symbol}</span>
                  <div>
                    <p className="font-semibold">{currency.code}</p>
                    <p className="text-sm text-muted-foreground">{currency.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

