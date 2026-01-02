"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Package, 
  FolderKanban,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Pencil,
  Mail,
  AlertCircle,
  Settings,
  TrendingUp,
  CreditCard
} from "lucide-react"
import { 
  useGetOrganization,
  useGetCurrentUser,
  useGetOrganizationUsers,
  useGetOrganizationStats,
  useUpdateOrganization,
  useUpdateOrganizationSubscription,
  useUpdateUserRoleInOrganization,
  useRemoveUserFromOrganization,
} from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { canInviteUsers, canManageSubscription } from "@/lib/permissions"
import { LimitIndicator } from "@/components/organization/LimitIndicator"
import { useTranslate, translatePlural } from "@/lib/translations"

// Subscription plans configuration (labels are translated in the component)
const SUBSCRIPTION_PLANS = [
  { value: 'free', color: 'bg-grey-100 text-grey-700' },
  { value: 'starter', color: 'bg-blue-100 text-blue-700' },
  { value: 'professional', color: 'bg-purple-100 text-purple-700' },
  { value: 'enterprise', color: 'bg-primary-100 text-primary-700' },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success-50 text-success-700 border-success-200',
  cancelled: 'bg-grey-50 text-grey-700 border-grey-200',
  past_due: 'bg-warning-50 text-warning-700 border-warning-200',
  trialing: 'bg-info-50 text-info-700 border-info-200',
}

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const organizationId = parseInt(params.id as string)
  
  // Translations
  const t = useTranslate('organizations.detail')
  const tCommon = useTranslate('common')
  const tUsers = useTranslate('organizations.detail.users')
  const tStats = useTranslate('organizations.detail.stats')
  const tEdit = useTranslate('organizations.detail.edit')
  const tSubscription = useTranslate('organizations.detail.subscription')
  const tSettings = useTranslate('organizations.detail.settings')
  const tPlans = useTranslate('organizations.plans')
  const tStatus = useTranslate('organizations.status')
  
  const { data: currentUser } = useGetCurrentUser()
  const { data: organization, isLoading: orgLoading } = useGetOrganization(organizationId)
  const { data: orgUsers, isLoading: isLoadingUsers } = useGetOrganizationUsers(organizationId)
  const { data: orgStats, isLoading: isLoadingStats } = useGetOrganizationStats(organizationId)
  
  const updateOrgMutation = useUpdateOrganization()
  const updateSubscriptionMutation = useUpdateOrganizationSubscription()
  const updateUserRoleMutation = useUpdateUserRoleInOrganization()
  const removeUserMutation = useRemoveUserFromOrganization()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    slug: '',
  })
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [removingUserId, setRemovingUserId] = useState<number | null>(null)

  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isOwner = currentUser?.role === 'owner' && currentUser?.organization_id === organizationId
  const canEdit = isSuperAdmin || isOwner
  const canManageSub = canManageSubscription(currentUser) && (isSuperAdmin || isOwner)

  // Initialize edit data when organization loads
  useEffect(() => {
    if (organization) {
      setEditData({
        name: organization.name,
        slug: organization.slug,
      })
    }
  }, [organization?.id])

  const handleEdit = async () => {
    if (!editData.name.trim()) {
      toast({
        title: tCommon('error'),
        description: tEdit('nameRequired'),
        variant: "destructive",
      })
      return
    }

    try {
      await updateOrgMutation.mutateAsync({
        orgId: organizationId,
        data: {
          name: editData.name,
          slug: editData.slug,
        },
      })
      toast({
        title: tEdit('saved'),
        description: tEdit('savedDesc'),
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : tEdit('error'),
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubscription = async () => {
    if (!selectedPlan) return

    try {
      await updateSubscriptionMutation.mutateAsync({
        orgId: organizationId,
        subscriptionPlan: selectedPlan,
      })
      const planLabel = tPlans(selectedPlan as any) || selectedPlan
      toast({
        title: tSubscription('updated'),
        description: tSubscription('updatedDesc', { plan: planLabel }),
      })
      setIsSubscriptionDialogOpen(false)
      setSelectedPlan('')
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : tSubscription('error'),
        variant: "destructive",
      })
    }
  }

  const openSubscriptionDialog = () => {
    if (organization) {
      setSelectedPlan(organization.subscription_plan)
      setIsSubscriptionDialogOpen(true)
    }
  }

  const handleRoleChange = async (user: any, newRole: string) => {
    setUpdatingUserId(user.id)
    try {
      await updateUserRoleMutation.mutateAsync({
        orgId: organizationId,
        userId: user.id,
        data: { role: newRole as any },
      })
      const userName = user.full_name || user.email
      toast({
        title: tUsers('actions.roleUpdated'),
        description: tUsers('actions.roleUpdatedDesc', { name: userName }),
      })
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : tUsers('errorRole'),
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleRemoveUser = async (user: any) => {
    const userName = user.full_name || user.email
    if (!confirm(tUsers('actions.removeConfirm', { name: userName }))) {
      return
    }

    setRemovingUserId(user.id)
    try {
      await removeUserMutation.mutateAsync({
        orgId: organizationId,
        userId: user.id,
      })
      toast({
        title: tUsers('actions.userRemoved'),
        description: tUsers('actions.userRemovedDesc', { name: userName }),
      })
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : tUsers('errorRemove'),
        variant: "destructive",
      })
    } finally {
      setRemovingUserId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'past_due':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-error-500'
    if (percentage >= 70) return 'bg-warning-500'
    return 'bg-success-500'
  }

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{tCommon('error')}</CardTitle>
            <CardDescription>{t('notFound')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/settings/organizations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tCommon('back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/settings/organizations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon('back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">{organization.name}</h1>
            <p className="text-grey-600 mt-1">{t('description')}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {canManageSub && (
              <Button
                variant="outline"
                onClick={openSubscriptionDialog}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('changePlan')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              {tCommon('edit')}
            </Button>
          </div>
        )}
      </div>

      {/* Limit Warnings */}
      {orgStats && (
        <>
          {orgStats.usage_percentage.users >= 90 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {tStats('warnings.usersLimit', { percentage: orgStats.usage_percentage.users.toFixed(0) })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings/billing')}
                  className="ml-4"
                >
                  {tStats('warnings.viewPlans')}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {orgStats.usage_percentage.projects >= 90 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {tStats('warnings.projectsLimit', { percentage: orgStats.usage_percentage.projects.toFixed(0) })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings/billing')}
                  className="ml-4"
                >
                  {tStats('warnings.viewPlans')}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {orgStats.usage_percentage.services >= 90 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {tStats('warnings.servicesLimit', { percentage: orgStats.usage_percentage.services.toFixed(0) })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings/billing')}
                  className="ml-4"
                >
                  {tStats('warnings.viewPlans')}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {orgStats.usage_percentage.team_members >= 90 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {tStats('warnings.teamMembersLimit', { percentage: orgStats.usage_percentage.team_members.toFixed(0) })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings/billing')}
                  className="ml-4"
                >
                  {tStats('warnings.viewPlans')}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">{t('tabs.details')}</TabsTrigger>
          <TabsTrigger value="users">
            {t('tabs.users')} {orgUsers && `(${orgUsers.total})`}
          </TabsTrigger>
          <TabsTrigger value="stats">{t('tabs.stats')}</TabsTrigger>
          <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{t('info.title')}</CardTitle>
              <CardDescription>{t('info.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-grey-600">{t('info.name')}</Label>
                  <p className="text-grey-900 font-medium mt-1">{organization.name}</p>
                </div>
                <div>
                  <Label className="text-grey-600">{t('info.slug')}</Label>
                  <p className="text-grey-900 font-mono text-sm mt-1">{organization.slug}</p>
                </div>
                <div>
                  <Label className="text-grey-600">{t('info.subscriptionPlan')}</Label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={SUBSCRIPTION_PLANS.find(p => p.value === organization.subscription_plan)?.color || ''}
                    >
                      {tPlans(organization.subscription_plan as any) || organization.subscription_plan}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-grey-600">{t('info.status')}</Label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={STATUS_COLORS[organization.subscription_status] || STATUS_COLORS.active}
                    >
                      <span className="flex items-center gap-1.5">
                        {getStatusIcon(organization.subscription_status)}
                        {tStatus(organization.subscription_status as any) || organization.subscription_status}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-grey-600">{t('info.createdAt')}</Label>
                  <p className="text-grey-900 text-sm mt-1">
                    {new Date(organization.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-grey-600">{t('info.updatedAt')}</Label>
                  <p className="text-grey-900 text-sm mt-1">
                    {organization.updated_at 
                      ? new Date(organization.updated_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : t('info.notAvailable')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{tUsers('title')}</CardTitle>
                  <CardDescription>
                    {translatePlural('organizations.detail.users.count', orgUsers?.total || 0, { count: orgUsers?.total || 0 })}
                  </CardDescription>
                </div>
                {canInviteUsers(currentUser) && (
                  <Button onClick={() => router.push('/settings/users')}>
                    <Mail className="w-4 h-4 mr-2" />
                    {tUsers('inviteUser')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
              ) : orgUsers && orgUsers.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tUsers('columns.name')}</TableHead>
                      <TableHead>{tUsers('columns.email')}</TableHead>
                      <TableHead>{tUsers('columns.role')}</TableHead>
                      <TableHead>{tUsers('columns.changeRole')}</TableHead>
                      <TableHead className="text-right">{tUsers('columns.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgUsers.items.map((user) => {
                      const getUserRoleLabel = (role: string) => {
                        const roleMap: Record<string, string> = {
                          'org_admin': tUsers('roles.admin'),
                          'owner': tUsers('roles.owner'),
                          'admin_financiero': tUsers('roles.financialAdmin'),
                          'product_manager': tUsers('roles.productManager'),
                          'collaborator': tUsers('roles.collaborator'),
                          'user': tUsers('roles.member'),
                        };
                        return roleMap[role] || tUsers('roles.member');
                      };
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || tUsers('roles.noName')}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getUserRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user, value)}
                                disabled={updatingUserId === user.id || user.id === currentUser?.id}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="org_admin">{tUsers('roles.selectAdmin')}</SelectItem>
                                  <SelectItem value="user">{tUsers('roles.selectMember')}</SelectItem>
                                </SelectContent>
                              </Select>
                              {updatingUserId === user.id && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/settings/users')}
                              >
                                {tUsers('actions.viewDetails')}
                              </Button>
                              {canEdit && user.id !== currentUser?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user)}
                                  disabled={removingUserId === user.id}
                                  className="text-error-600 hover:text-error-700 hover:bg-error-50"
                                >
                                  {removingUserId === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    tUsers('actions.remove')
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-grey-500">
                  {tUsers('noUsers')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>{tStats('title')}</CardTitle>
              <CardDescription>{tStats('description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
              ) : orgStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Users */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">{tStats('resources.users')}</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.users}</p>
                        {orgStats.limits.users !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              {tStats('of', { limit: orgStats.limits.users, percentage: orgStats.usage_percentage.users.toFixed(0) })}
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.users} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">{tStats('unlimited')}</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Projects */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">{tStats('resources.projects')}</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.projects}</p>
                        {orgStats.limits.projects !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              {tStats('of', { limit: orgStats.limits.projects, percentage: orgStats.usage_percentage.projects.toFixed(0) })}
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.projects} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">{tStats('unlimited')}</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Services */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">{tStats('resources.services')}</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.services}</p>
                        {orgStats.limits.services !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              {tStats('of', { limit: orgStats.limits.services, percentage: orgStats.usage_percentage.services.toFixed(0) })}
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.services} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">{tStats('unlimited')}</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">{tStats('resources.teamMembers')}</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.team_members}</p>
                        {orgStats.limits.team_members !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              {tStats('of', { limit: orgStats.limits.team_members, percentage: orgStats.usage_percentage.team_members.toFixed(0) })}
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.team_members} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">{tStats('unlimited')}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Limit Indicators */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-grey-900">{tStats('limitsTitle')}</h3>
                      {(orgStats.usage_percentage.users >= 80 || 
                        orgStats.usage_percentage.projects >= 80 || 
                        orgStats.usage_percentage.services >= 80 ||
                        orgStats.usage_percentage.team_members >= 80) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/settings/billing')}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {tStats('updatePlan')}
                        </Button>
                      )}
                    </div>
                    <LimitIndicator
                      current={orgStats.current_usage.users}
                      limit={orgStats.limits.users}
                      resourceName={tStats('resources.users')}
                    />
                    <LimitIndicator
                      current={orgStats.current_usage.projects}
                      limit={orgStats.limits.projects}
                      resourceName={tStats('resources.projects')}
                    />
                    <LimitIndicator
                      current={orgStats.current_usage.services}
                      limit={orgStats.limits.services}
                      resourceName={tStats('resources.services')}
                    />
                    <LimitIndicator
                      current={orgStats.current_usage.team_members}
                      limit={orgStats.limits.team_members}
                      resourceName={tStats('resources.teamMembers')}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-grey-500">
                  {tStats('noStats')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{tSettings('subscription.title')}</CardTitle>
                <CardDescription>{tSettings('subscription.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-grey-600">{tSettings('subscription.currentPlan')}</Label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={SUBSCRIPTION_PLANS.find(p => p.value === organization.subscription_plan)?.color || ''}
                      >
                        {tPlans(organization.subscription_plan as any) || organization.subscription_plan}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-grey-600">{tSettings('subscription.currentStatus')}</Label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={STATUS_COLORS[organization.subscription_status] || STATUS_COLORS.active}
                      >
                        <span className="flex items-center gap-1.5">
                          {getStatusIcon(organization.subscription_status)}
                          {tStatus(organization.subscription_status as any) || organization.subscription_status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/settings/billing')}
                    className="w-full md:w-auto"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {tSettings('subscription.manageBilling')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tSettings('advanced.title')}</CardTitle>
                <CardDescription>{tSettings('advanced.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {organization.settings && Object.keys(organization.settings).length > 0 ? (
                  <div className="space-y-2">
                    <Label>{tSettings('advanced.description')}</Label>
                    <pre className="p-4 bg-grey-50 rounded-lg text-sm overflow-auto max-h-96 border border-grey-200">
                      {JSON.stringify(organization.settings, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-grey-500">
                    {tSettings('advanced.noConfig')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tEdit('title')}</DialogTitle>
            <DialogDescription>
              {tEdit('description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{tEdit('nameLabel')}</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder={tEdit('namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{tEdit('slugLabel')}</Label>
              <Input
                id="slug"
                value={editData.slug}
                onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                placeholder={tEdit('slugPlaceholder')}
              />
              <p className="text-xs text-grey-500">
                {tEdit('slugHelp')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateOrgMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateOrgMutation.isPending || !editData.name.trim()}
            >
              {updateOrgMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tEdit('saving')}
                </>
              ) : (
                tCommon('save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tSubscription('title')}</DialogTitle>
            <DialogDescription>
              {tSubscription('description', { name: organization.name })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">{tSubscription('planLabel')}</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger id="plan" className="h-10">
                  <SelectValue placeholder={tSubscription('planPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {tPlans(plan.value as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {organization && (
              <div className="p-3 bg-grey-50 rounded-lg text-sm text-grey-600">
                <p>{tSubscription('currentPlan')}: <strong className="text-grey-900">
                  {tPlans(organization.subscription_plan as any)}
                </strong></p>
                <p>{tSubscription('currentStatus')}: <strong className="text-grey-900">{tStatus(organization.subscription_status as any)}</strong></p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubscriptionDialogOpen(false)}
              disabled={updateSubscriptionMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleUpdateSubscription}
              disabled={updateSubscriptionMutation.isPending || !selectedPlan}
            >
              {updateSubscriptionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tSubscription('updating')}
                </>
              ) : (
                tStats('updatePlan')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

