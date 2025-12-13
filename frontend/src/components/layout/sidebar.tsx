"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  DollarSign,
  Users,
  Package,
  BarChart3,
  MessageSquare,
  Receipt,
  UserCog,
  CheckCircle2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useGetPendingDeleteRequestsCount, useGetCurrentUser } from "@/lib/queries"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      {
        name: "Costs",
        href: "/settings/costs",
        icon: DollarSign,
      },
      {
        name: "Team",
        href: "/settings/team",
        icon: Users,
      },
      {
        name: "Services",
        href: "/settings/services",
        icon: Package,
      },
      {
        name: "Currency",
        href: "/settings/currency",
        icon: DollarSign,
      },
      {
        name: "Taxes",
        href: "/settings/taxes",
        icon: Receipt,
      },
      {
        name: "Users & Roles",
        href: "/settings/users",
        icon: UserCog,
      },
      {
        name: "Approvals",
        href: "/settings/approvals",
        icon: CheckCircle2,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: pendingCount } = useGetPendingDeleteRequestsCount()
  const { data: currentUser } = useGetCurrentUser()

  const filteredNavigation = navigation

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">AgenciaOps</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                  {item.name}
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === child.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <child.icon className="h-5 w-5" />
                    <span className="flex-1">{child.name}</span>
                    {child.href === '/settings/approvals' && pendingCount && pendingCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {pendingCount}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
