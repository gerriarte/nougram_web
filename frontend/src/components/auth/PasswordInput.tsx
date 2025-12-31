"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
  showToggle?: boolean
}

export function PasswordInput({ 
  className, 
  showStrength = false, 
  showToggle = true,
  value,
  onChange,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={cn("pr-10", className)}
        {...props}
      />
      {showToggle && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-grey-500" />
          ) : (
            <Eye className="h-4 w-4 text-grey-500" />
          )}
        </Button>
      )}
    </div>
  )
}


