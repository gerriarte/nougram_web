"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Check, Plus, Settings, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { useGetCurrentUser, useGetOrganizations, useGetMyOrganization, useSwitchOrganization } from '@/lib/queries'
import { useToast } from '@/hooks/use-toast'

interface OrganizationSwitcherProps {
  currentOrgId: string
  onOrgChange: (orgId: string) => void
  onNavigate?: (page: string) => void
}

export function OrganizationSwitcher({ currentOrgId, onOrgChange, onNavigate }: OrganizationSwitcherProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: currentUser } = useGetCurrentUser()
  const { data: myOrg } = useGetMyOrganization()
  const { data: organizationsData } = useGetOrganizations(1, 100, false)
  const switchOrganization = useSwitchOrganization()
  
  const organizations = (organizationsData?.items && Array.isArray(organizationsData.items)) ? organizationsData.items : []
  const activeOrg = myOrg || organizations.find(org => org.id === Number(currentOrgId)) || organizations[0]
  
  const orgName = activeOrg?.name || currentUser?.full_name || 'Organization'
  const orgInitial = orgName.charAt(0).toUpperCase()

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      router.push(path)
    }
  }

  const handleOrgSelect = async (orgId: number) => {
    // Don't switch if already on this organization
    if (Number(currentOrgId) === orgId) {
      return
    }

    try {
      await switchOrganization.mutateAsync(orgId)
      
      // Notify parent component
      if (onOrgChange) {
        onOrgChange(String(orgId))
      }
      
      // Show success message
      toast({
        title: "Organización cambiada",
        description: `Ahora estás trabajando con ${organizations.find(org => org.id === orgId)?.name || 'la organización seleccionada'}`,
      })
      
      // Reload page to refresh all data with new organization context
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cambiar de organización",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 px-2 gap-2 hover:bg-grey-100">
          <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
            {orgInitial}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium leading-none text-grey-900">{orgName}</p>
            <p className="text-xs text-grey-500">Organization</p>
          </div>
          <ChevronDown className="w-4 h-4 text-grey-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white">
        <DropdownMenuLabel className="text-xs text-grey-500 font-normal">Organizations</DropdownMenuLabel>
        {organizations.map((org) => {
          const isActive = activeOrg?.id === org.id
          const orgInitial = org.name.charAt(0).toUpperCase()
          
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleOrgSelect(org.id)}
              className="cursor-pointer"
              disabled={switchOrganization.isPending}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-6 h-6 rounded bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                  {orgInitial}
                </div>
                <span className={`flex-1 ${isActive ? 'font-medium' : ''}`}>
                  {org.name}
                </span>
                {switchOrganization.isPending && isActive ? (
                  <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                ) : isActive ? (
                  <Check className="w-4 h-4 text-primary-600" />
                ) : null}
              </div>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleNavigate('/settings/organizations')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

