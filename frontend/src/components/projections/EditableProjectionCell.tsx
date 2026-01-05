"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditableProjectionCellProps {
  quantity: number;
  hoursPerUnit: number;
  onSave: (quantity: number, hoursPerUnit: number) => void;
  disabled?: boolean;
  serviceName?: string;
  serviceMargin?: number;
}

export function EditableProjectionCell({
  quantity,
  hoursPerUnit,
  onSave,
  disabled = false,
  serviceName,
  serviceMargin,
}: EditableProjectionCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity.toString());
  const [localHours, setLocalHours] = useState(hoursPerUnit.toString());
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const hoursInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuantity(quantity.toString());
    setLocalHours(hoursPerUnit.toString());
  }, [quantity, hoursPerUnit]);

  useEffect(() => {
    if (isEditing && quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    const qty = parseFloat(localQuantity) || 0;
    const hrs = parseFloat(localHours) || 0;
    
    if (qty !== quantity || hrs !== hoursPerUnit) {
      onSave(Math.max(0, qty), Math.max(0, hrs));
    }
    
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLocalQuantity(quantity.toString());
      setLocalHours(hoursPerUnit.toString());
      setIsEditing(false);
    } else if (e.key === 'Tab') {
      if (e.currentTarget === quantityInputRef.current) {
        e.preventDefault();
        hoursInputRef.current?.focus();
      }
    }
  };

  const totalHours = quantity * hoursPerUnit;
  const displayValue = totalHours > 0 
    ? `${quantity} × ${hoursPerUnit.toFixed(1)}h = ${totalHours.toFixed(1)}h`
    : '-';

  if (isEditing) {
    return (
      <div className="flex gap-1 items-center p-1" onBlur={handleBlur}>
        <Input
          ref={quantityInputRef}
          type="number"
          min="0"
          value={localQuantity}
          onChange={(e) => setLocalQuantity(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 w-16 text-xs"
          placeholder="Qty"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <Input
          ref={hoursInputRef}
          type="number"
          min="0"
          step="0.1"
          value={localHours}
          onChange={(e) => setLocalHours(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 w-16 text-xs"
          placeholder="Hours"
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className={cn(
              "px-2 py-1 rounded cursor-pointer hover:bg-grey-100 transition-colors text-sm",
              disabled && "cursor-not-allowed opacity-50",
              totalHours === 0 && "text-muted-foreground"
            )}
          >
            {displayValue}
          </div>
        </TooltipTrigger>
        {serviceName && (
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{serviceName}</p>
              {serviceMargin !== undefined && (
                <p className="text-xs">Margen objetivo: {(serviceMargin * 100).toFixed(0)}%</p>
              )}
              <p className="text-xs">Click para editar</p>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
