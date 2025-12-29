import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Building2, Users, Check, AlertTriangle, Download, Plus, MoreHorizontal } from 'lucide-react';
import { mockOrganizations, mockUsers, mockCurrencies } from '../../lib/mock-data';
import { InviteUserDialog } from '../dialogs/InviteUserDialog';

export function OrganizationSettingsPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [users] = useState(mockUsers);

    // Mock current org data
    const currentOrg = mockOrganizations[0];

    const handleInvite = (data: { email: string; role: string; message: string }) => {
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.email.split('@')[0], // Placeholder name
            email: data.email,
            role: data.role as 'admin' | 'manager' | 'member',
            status: 'pending' // Add status to User type if not exists, or handle visually
        };
        console.log('Invited:', newUser);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-grey-900">Organization Settings</h1>
                    <p className="text-grey-600">Manage your organization profile, team, and billing</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="w-full flex justify-center">
                    <TabsList className="flex w-full max-w-[600px] bg-grey-100 p-1 rounded-lg h-11">
                        <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                        <TabsTrigger value="users" className="flex-1">Users & Roles</TabsTrigger>
                        <TabsTrigger value="billing" className="flex-1">Billing</TabsTrigger>
                        <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
                    </TabsList>
                </div>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Subscription Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-grey-500">Current Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold capitalize">{currentOrg.plan}</span>
                                    <Badge className="bg-success-100 text-success-700 hover:bg-success-100">Active</Badge>
                                </div>
                                <p className="text-xs text-grey-500 mt-1">Renews on Jan 1, 2026</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full text-xs h-8" onClick={() => setActiveTab('billing')}>
                                    Manage Subscription
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Usage Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-grey-500">Active Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">{users.length} / 10</span>
                                    <Users className="h-4 w-4 text-grey-500" />
                                </div>
                                <div className="w-full bg-grey-100 h-2 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-primary-500 h-full rounded-full" style={{ width: `${(users.length / 10) * 100}%` }} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full text-xs h-8" onClick={() => setActiveTab('users')}>
                                    Manage Team
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Projects Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-grey-500">Active Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">8</span>
                                    <Building2 className="h-4 w-4 text-grey-500" />
                                </div>
                                <p className="text-xs text-grey-500 mt-1">2 projects created this month</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest actions performed in your organization</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-grey-100 last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">AT</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-grey-900">Alex Thompson created a new quote</p>
                                                <p className="text-xs text-grey-500">2 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* USERS TAB */}
                <TabsContent value="users" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">Team Members</h3>
                            <p className="text-sm text-grey-500">Manage who has access to your workspace</p>
                        </div>
                        <Button onClick={() => setIsInviteOpen(true)} className="bg-primary-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Invite Member
                        </Button>
                    </div>

                    <Card>
                        <div className="rounded-md border border-grey-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-grey-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-grey-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-grey-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Avatar className="h-8 w-8 mr-3">
                                                        <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-medium text-grey-900">{user.name}</div>
                                                        <div className="text-sm text-grey-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="outline" className={
                                                    user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-grey-50 text-grey-700 border-grey-200'
                                                }>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4 text-grey-500" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Plan</CardTitle>
                                    <CardDescription>You are currently on the <span className="font-bold capitalize">{currentOrg.plan}</span> plan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">$49</span>
                                        <span className="text-grey-500">/month</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-grey-700">
                                            <Check className="h-4 w-4 text-primary-600" />
                                            <span>Unlimited Projects</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-grey-700">
                                            <Check className="h-4 w-4 text-primary-600" />
                                            <span>Advanced Analytics</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-grey-700">
                                            <Check className="h-4 w-4 text-primary-600" />
                                            <span>Priority Support</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-3">
                                    <Button className="bg-primary-600 text-white">Upgrade Plan</Button>
                                    <Button variant="outline" className="text-error-600 border-error-200 hover:bg-error-50">Cancel Subscription</Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs text-grey-500 border-b border-grey-100">
                                                <th className="pb-2">Date</th>
                                                <th className="pb-2">Amount</th>
                                                <th className="pb-2">Status</th>
                                                <th className="pb-2 text-right">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {[1, 2, 3].map((i) => (
                                                <tr key={i} className="border-b border-grey-50 last:border-0">
                                                    <td className="py-3">Dec 1, 2024</td>
                                                    <td className="py-3">$49.00</td>
                                                    <td className="py-3"><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge></td>
                                                    <td className="py-3 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Download className="h-4 w-4 text-grey-500" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="bg-primary-50 border-primary-100">
                                <CardHeader>
                                    <CardTitle className="text-primary-900">Enterprise</CardTitle>
                                    <CardDescription className="text-primary-700">Need more power?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-primary-800 mb-4">Get custom integrations, dedicated support, and SLA guarantees.</p>
                                    <Button className="w-full bg-primary-600 text-white">Contact Sales</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Profile</CardTitle>
                            <CardDescription>Update your organization details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="orgName">Organization Name</Label>
                                    <Input id="orgName" defaultValue={currentOrg.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="orgSlug">Organization URL</Label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-grey-300 bg-grey-50 text-grey-500 text-sm">
                                            agenciaops.com/
                                        </span>
                                        <Input id="orgSlug" defaultValue={currentOrg.slug} className="rounded-l-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                                        {currentOrg.name.charAt(0)}
                                    </div>
                                    <Button variant="outline">Upload New Logo</Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="bg-primary-600 text-white">Save Changes</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Regional Settings</CardTitle>
                            <CardDescription>Set your default currency and timezone</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Currency</Label>
                                    <Select defaultValue="USD">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockCurrencies.map((currency) => (
                                                <SelectItem key={currency.code} value={currency.code}>
                                                    {currency.name} ({currency.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <Select defaultValue="UTC">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                                            <SelectItem value="EST">EST (GMT-5)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-error-200 bg-error-50">
                        <CardHeader>
                            <CardTitle className="text-error-700 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-error-600 mb-4">
                                Deleting your organization is irreversible. All projects, quotes, and data will be permanently removed.
                            </p>
                            <Button variant="destructive" className="bg-error-600 hover:bg-error-700 text-white">
                                Delete Organization
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <InviteUserDialog
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                onInvite={handleInvite}
            />
        </div>
    );
}
