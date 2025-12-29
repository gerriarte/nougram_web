"use client"

import { useRouter } from 'next/navigation'
import { Bell, Search, Settings, Rocket, Globe, Plug, CheckCircle, CreditCard, Building2, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { OrganizationSwitcher } from './OrganizationSwitcher'
import { PageGuide } from '../ui/PageGuide'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '../ui/dropdown-menu'
import { Badge } from '../ui/badge'
import { ReactNode } from 'react'
import { useGetCurrentUser, useGetMyCreditBalance } from '@/lib/queries'
import { canManageSubscription, consumesCredits } from '@/lib/permissions'

interface AppHeaderProps {
  title: string
  description?: string
  currentOrgId?: string | number
  onOrgChange?: (orgId: string) => void
  helpContent?: {
    title: string
    description?: string
    content?: ReactNode
  }
}

// Helper function to switch organization (would need API endpoint)
async function switchOrganization(orgId: number): Promise<void> {
  // This would call an API endpoint to switch the user's active organization
  // For now, we'll just reload the page which will use the JWT's organization_id
  // In the future, you could implement: POST /auth/switch-organization with body { organization_id }
  console.log('Switching to organization:', orgId)
  // Reload page to get new organization context
  window.location.reload()
}

export function AppHeader({
  title,
  description,
  currentOrgId,
  onOrgChange,
  helpContent
}: AppHeaderProps) {
  const router = useRouter()
  const { data: currentUser } = useGetCurrentUser()
  const { data: creditBalance, isLoading: creditBalanceLoading } = useGetMyCreditBalance()
  
  const showCreditsBadge = consumesCredits(currentUser)

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <header className="h-16 bg-white border-b border-grey-200 fixed top-0 right-0 left-64 z-10 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-grey-900">{title}</h1>
        {description && (
          <p className="text-sm text-grey-500">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Help Guide */}
        {helpContent && (
          <PageGuide
            title={helpContent.title}
            description={helpContent.description}
          >
            {helpContent.content}
          </PageGuide>
        )}

        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
          <Input
            placeholder="Buscar..."
            className="pl-9 bg-grey-50 border-grey-200 focus:bg-white transition-colors"
          />
        </div>

        <div className="h-8 w-px bg-grey-200 mx-2" />

        {/* Credits Badge - Solo para usuarios que consumen créditos */}
        {showCreditsBadge && (
          <Button
            variant="outline"
            onClick={() => handleNavigate('/credits')}
            className="flex items-center gap-2 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
            aria-label={`Créditos disponibles: ${creditBalance?.is_unlimited ? 'ilimitados' : creditBalance?.credits_available || 0}`}
          >
            <CreditCard className="w-4 h-4" aria-hidden="true" />
            {creditBalanceLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-label="Cargando créditos" />
            ) : (
              <>
                <span className="font-semibold">
                  {creditBalance?.is_unlimited 
                    ? '∞' 
                    : creditBalance?.credits_available.toLocaleString() || '0'}
                </span>
                <span className="text-muted-foreground text-sm hidden sm:inline">créditos</span>
              </>
            )}
          </Button>
        )}

        {showCreditsBadge && <div className="h-8 w-px bg-grey-200 mx-2" />}

        {/* Organization Switcher - Solo si hay currentOrgId */}
        {currentOrgId && onOrgChange && (
          <OrganizationSwitcher
            currentOrgId={String(currentOrgId)}
            onOrgChange={onOrgChange}
            onNavigate={handleNavigate}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-grey-500 hover:text-primary-600 hover:bg-primary-50">
            <Bell className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-grey-500 hover:text-primary-600 hover:bg-primary-50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Configuración de la Herramienta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleNavigate('/settings/currency')}
                className="cursor-pointer"
              >
                <Globe className="w-4 h-4 mr-2" />
                Moneda
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleNavigate('/settings/integrations')}
                className="cursor-pointer"
              >
                <Plug className="w-4 h-4 mr-2" />
                Integraciones
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleNavigate('/settings/approvals')}
                className="cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobaciones
              </DropdownMenuItem>
              {canManageSubscription(currentUser) && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleNavigate('/settings/billing')}
                    className="cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Suscripciones
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigate('/settings/organizations')}
                    className="cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Organizaciones
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleNavigate('/onboarding')}
                className="cursor-pointer"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Configuración Inicial
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

