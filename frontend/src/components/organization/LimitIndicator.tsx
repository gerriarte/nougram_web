"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface LimitIndicatorProps {
  current: number
  limit: number // -1 means unlimited
  resourceName: string
  showWarning?: boolean
  showError?: boolean
  className?: string
}

/**
 * Component to display usage limit information with visual indicators
 * Shows current usage vs limit, progress bar, and warnings/errors
 */
export function LimitIndicator({
  current,
  limit,
  resourceName,
  showWarning = true,
  showError = true,
  className,
}: LimitIndicatorProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : limit === 0 ? 100 : Math.min(100, (current / limit) * 100)
  const isAtLimit = !isUnlimited && current >= limit
  const isNearLimit = !isUnlimited && !isAtLimit && percentage >= 80
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - current)

  const getProgressClassName = () => {
    if (isAtLimit) return "[&>div]:bg-destructive"
    if (isNearLimit) return "[&>div]:bg-warning-500"
    return "[&>div]:bg-primary-500"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-grey-600">
          {resourceName}: <span className="font-medium text-grey-900">{current}</span>
          {!isUnlimited && (
            <>
              {" / "}
              <span className="font-medium text-grey-900">{limit}</span>
            </>
          )}
          {isUnlimited && (
            <Badge variant="outline" className="ml-2 text-xs">
              Ilimitado
            </Badge>
          )}
        </span>
        {!isUnlimited && (
          <span
            className={cn(
              "text-xs font-medium",
              isAtLimit
                ? "text-destructive"
                : isNearLimit
                ? "text-warning-700"
                : "text-grey-600"
            )}
          >
            {percentage.toFixed(0)}% usado
          </span>
        )}
      </div>

      {!isUnlimited && (
        <Progress value={percentage} className={cn("h-2", getProgressClassName())} />
      )}

      {/* Warning when near limit */}
      {showWarning && isNearLimit && !isAtLimit && (
        <Alert className="py-2 bg-warning-50 border-warning-200">
          <AlertTriangle className="h-4 w-4 text-warning-600" />
          <AlertDescription className="text-sm text-warning-700">
            Te quedan <strong>{remaining}</strong> {resourceName.toLowerCase()} disponibles. 
            Considera actualizar tu plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Error when at limit */}
      {showError && isAtLimit && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Has alcanzado el límite de {resourceName.toLowerCase()} ({limit}). 
            No puedes crear más hasta actualizar tu plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Info when unlimited */}
      {isUnlimited && (
        <Alert className="py-2 bg-info-50 border-info-200">
          <Info className="h-4 w-4 text-info-600" />
          <AlertDescription className="text-sm text-info-700">
            Plan ilimitado: puedes crear {resourceName.toLowerCase()} sin restricciones.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Helper function to check if a resource can be created
 */
export function canCreateResource(current: number, limit: number): boolean {
  if (limit === -1) return true // Unlimited
  return current < limit
}

/**
 * Helper function to get remaining capacity
 */
export function getRemainingCapacity(current: number, limit: number): number {
  if (limit === -1) return Infinity
  return Math.max(0, limit - current)
}

