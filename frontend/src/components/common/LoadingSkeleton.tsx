"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface LoadingSkeletonProps {
  type?: "card" | "table" | "list" | "chart"
  count?: number
  className?: string
}

export function LoadingSkeleton({
  type = "card",
  count = 1,
  className,
}: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className={className}>
        <div className="space-y-3">
          {/* Table header */}
          <div className="flex gap-4 border-b pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: count }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-2">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === "list") {
    return (
      <div className={`space-y-3 ${className || ""}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === "chart") {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return null
}

