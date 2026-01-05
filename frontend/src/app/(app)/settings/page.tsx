"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Package, 
  DollarSign, 
  Receipt, 
  Globe, 
  Settings as SettingsIcon,
  Building2,
  Plug,
  CheckCircle,
  CreditCard,
  UserCog,
  FileText
} from "lucide-react"
import { useGetCurrentUser } from "@/lib/queries"
import { canViewSensitiveData, canManageSubscription, canInviteUsers } from "@/lib/permissions"

export default function SettingsPage() {
  const router = useRouter()
  const { data: currentUser } = useGetCurrentUser()

  // Business Structure Settings
  const businessStructureSections = [
    {
      id: 'team',
      title: 'Miembros del Equipo',
      description: 'Gestiona miembros del equipo y sus roles',
      icon: Users,
      path: '/settings/team',
      requiresPermission: () => canViewSensitiveData(currentUser)
    },
    {
      id: 'users',
      title: 'Usuarios',
      description: 'Gestiona usuarios e invitaciones de la organización',
      icon: UserCog,
      path: '/settings/users',
      requiresPermission: () => canInviteUsers(currentUser)
    },
    {
      id: 'services',
      title: 'Servicios',
      description: 'Configura tu catálogo de servicios',
      icon: Package,
      path: '/settings/services',
      requiresPermission: null
    },
    {
      id: 'costs',
      title: 'Costos Fijos',
      description: 'Gestiona costos fijos y variables',
      icon: DollarSign,
      path: '/settings/costs',
      requiresPermission: () => canViewSensitiveData(currentUser)
    },
    {
      id: 'taxes',
      title: 'Impuestos',
      description: 'Configura tasas y reglas de impuestos',
      icon: Receipt,
      path: '/settings/taxes',
      requiresPermission: null
    },
    {
      id: 'import',
      title: 'Importación Inteligente',
      description: 'Extrae datos de documentos usando IA',
      icon: FileText,
      path: '/settings/import',
      requiresPermission: null
    }
  ]

  // Tool Configuration Settings (shown in header dropdown)
  const toolConfigurationSections = [
    {
      id: 'currency',
      title: 'Moneda',
      description: 'Establece moneda por defecto y tasas de cambio',
      icon: Globe,
      path: '/settings/currency',
      requiresPermission: null
    },
    {
      id: 'integrations',
      title: 'Integraciones',
      description: 'Conecta con servicios externos',
      icon: Plug,
      path: '/settings/integrations',
      requiresPermission: null
    },
    {
      id: 'approvals',
      title: 'Aprobaciones',
      description: 'Gestiona solicitudes de aprobación',
      icon: CheckCircle,
      path: '/settings/approvals',
      requiresPermission: null
    },
    {
      id: 'billing',
      title: 'Suscripciones',
      description: 'Gestiona tu plan de suscripción',
      icon: CreditCard,
      path: '/settings/billing',
      requiresPermission: () => canManageSubscription(currentUser)
    },
    {
      id: 'organizations',
      title: 'Organizaciones',
      description: 'Gestiona organizaciones y suscripciones',
      icon: Building2,
      path: '/settings/organizations',
      requiresPermission: () => canManageSubscription(currentUser)
    }
  ]

  // Filter sections based on permissions
  const visibleBusinessSections = businessStructureSections.filter(section => {
    if (!section.requiresPermission) return true
    return section.requiresPermission()
  })

  const visibleToolSections = toolConfigurationSections.filter(section => {
    if (!section.requiresPermission) return true
    return section.requiresPermission()
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-grey-900">Configuración</h1>
        <p className="text-grey-600 mt-1">Gestiona la estructura de tu negocio y la configuración de la herramienta</p>
      </div>

      {/* Business Structure Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-grey-900 mb-1">Estructura del Negocio</h2>
          <p className="text-sm text-grey-600">Configura los elementos fundamentales de tu operación</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleBusinessSections.map((section) => {
            const Icon = section.icon
            return (
              <Card 
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(section.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tool Configuration Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-grey-900 mb-1">Configuración de la Herramienta</h2>
          <p className="text-sm text-grey-600">
            También disponible en el menú de configuración del header
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleToolSections.map((section) => {
            const Icon = section.icon
            return (
              <Card 
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(section.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-info-100 rounded-lg">
                      <Icon className="w-5 h-5 text-info-600" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
