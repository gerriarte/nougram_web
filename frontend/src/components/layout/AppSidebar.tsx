"use client"

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Settings, DollarSign, Users, Package, Receipt, ChevronDown, ChevronRight, UserCog, CreditCard, LifeBuoy } from 'lucide-react'
import { useGetCurrentUser } from '@/lib/queries'
import { canViewSensitiveData, canManageSubscription, canInviteUsers, isSupportRole } from '@/lib/permissions'

interface AppSidebarProps {
  currentOrgId?: string | number
}

export function AppSidebar({ currentOrgId }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: currentUser } = useGetCurrentUser()
  const [settingsOpen, setSettingsOpen] = useState(pathname?.startsWith('/settings') || false)

  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'projects', label: 'Proyectos', icon: FolderKanban, path: '/projects' },
    { id: 'credits', label: 'Créditos', icon: CreditCard, path: '/credits' },
    ...(isSupportRole(currentUser) ? [{ id: 'support', label: 'Soporte', icon: LifeBuoy, path: '/support' }] : [])
  ]

  // Business Structure Settings (in sidebar)
  // These are core business configuration items
  const businessStructureItems = [
    { id: 'team', label: 'Miembros del Equipo', icon: Users, path: '/settings/team', requiresPermission: () => canViewSensitiveData(currentUser) },
    { id: 'users', label: 'Usuarios', icon: UserCog, path: '/settings/users', requiresPermission: () => canInviteUsers(currentUser) },
    { id: 'services', label: 'Servicios', icon: Package, path: '/settings/services', requiresPermission: null },
    { id: 'costs', label: 'Costos Fijos', icon: DollarSign, path: '/settings/costs', requiresPermission: () => canViewSensitiveData(currentUser) },
    { id: 'taxes', label: 'Impuestos', icon: Receipt, path: '/settings/taxes', requiresPermission: null },
  ]

  // Filter business structure items based on permissions
  const visibleBusinessItems = businessStructureItems.filter(item => {
    if (!item.requiresPermission) return true
    return item.requiresPermission()
  })

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const isSettingsActive = pathname?.startsWith('/settings')

  return (
    <aside className="w-64 h-screen bg-white border-r border-grey-200 fixed left-0 top-0 flex flex-col z-20">
      {/* Logo/Header */}
      <div className="h-16 px-6 flex items-center border-b border-grey-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-primary-700 font-semibold">Nougram</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.path)

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-grey-700 hover:bg-grey-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}

          {/* Settings with Submenu */}
          <div className="space-y-1">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors
                ${isSettingsActive
                  ? 'bg-primary-500 text-white'
                  : 'text-grey-700 hover:bg-grey-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span>Configuración</span>
              </div>
              {settingsOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Business Structure Submenu */}
            {settingsOpen && (
              <div className="ml-4 space-y-1 border-l-2 border-grey-200 pl-2">
                {visibleBusinessItems.map((item) => {
                  const ItemIcon = item.icon
                  const isItemActive = pathname === item.path

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                        ${isItemActive
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-grey-600 hover:bg-grey-50'
                        }
                      `}
                    >
                      <ItemIcon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-grey-200 space-y-4">
        {/* User Profile */}
        {currentUser && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 text-xs font-medium">
                {getInitials(currentUser.full_name || currentUser.email)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-grey-900 truncate">{currentUser.full_name}</p>
              <p className="text-grey-600 text-xs">{currentUser.role || 'Usuario'}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
