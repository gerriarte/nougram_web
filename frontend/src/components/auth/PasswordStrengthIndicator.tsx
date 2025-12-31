"use client"

import { useMemo } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

type StrengthLevel = "weak" | "fair" | "good" | "strong"

interface StrengthConfig {
  level: StrengthLevel
  label: string
  color: string
  bgColor: string
  percentage: number
}

const getPasswordStrength = (password: string): StrengthConfig => {
  if (!password) {
    return {
      level: "weak",
      label: "Muy débil",
      color: "text-error-600",
      bgColor: "bg-error-500",
      percentage: 0,
    }
  }

  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  // Calculate strength score
  if (checks.length) strength += 1
  if (checks.uppercase) strength += 1
  if (checks.lowercase) strength += 1
  if (checks.number) strength += 1
  if (checks.special) strength += 1
  if (password.length >= 12) strength += 1

  if (strength <= 2) {
    return {
      level: "weak",
      label: "Débil",
      color: "text-error-600",
      bgColor: "bg-error-500",
      percentage: 25,
    }
  } else if (strength === 3) {
    return {
      level: "fair",
      label: "Regular",
      color: "text-warning-600",
      bgColor: "bg-warning-500",
      percentage: 50,
    }
  } else if (strength === 4) {
    return {
      level: "good",
      label: "Buena",
      color: "text-info-600",
      bgColor: "bg-info-500",
      percentage: 75,
    }
  } else {
    return {
      level: "strong",
      label: "Fuerte",
      color: "text-success-600",
      bgColor: "bg-success-500",
      percentage: 100,
    }
  }
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password])
  
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-medium", strength.color)}>
            Fortaleza: {strength.label}
          </span>
          <span className="text-grey-500">{strength.percentage}%</span>
        </div>
        <div className="h-2 w-full bg-grey-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", strength.bgColor)}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1 text-xs">
        <div className={cn("flex items-center gap-2", checks.length ? "text-success-600" : "text-grey-500")}>
          {checks.length ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          <span>Al menos 8 caracteres</span>
        </div>
        <div className={cn("flex items-center gap-2", checks.uppercase ? "text-success-600" : "text-grey-500")}>
          {checks.uppercase ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          <span>Una letra mayúscula</span>
        </div>
        <div className={cn("flex items-center gap-2", checks.lowercase ? "text-success-600" : "text-grey-500")}>
          {checks.lowercase ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          <span>Una letra minúscula</span>
        </div>
        <div className={cn("flex items-center gap-2", checks.number ? "text-success-600" : "text-grey-500")}>
          {checks.number ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          <span>Un número</span>
        </div>
        <div className={cn("flex items-center gap-2", checks.special ? "text-success-600" : "text-grey-500")}>
          {checks.special ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          <span>Un carácter especial (!@#$%^&*)</span>
        </div>
      </div>
    </div>
  )
}


