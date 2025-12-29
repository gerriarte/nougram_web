import { useState } from 'react';
import { Plus, Pencil, Trash, DollarSign, Users, Package, Coins, Receipt, UserCog, Building2, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { mockCosts, mockCompanyCosts, mockServices, mockTeamMembers, mockCurrencies, mockTaxes, mockUsers } from '../../lib/mock-data';
import { AddCostForm } from '../forms/AddCostForm';
import { AddCompanyCostForm } from '../forms/AddCompanyCostForm';
import { AddServiceForm } from '../forms/AddServiceForm';
import { AddTeamMemberForm } from '../forms/AddTeamMemberForm';
import { AddTaxForm } from '../forms/AddTaxForm';
import { EditTaxForm } from '../forms/EditTaxForm';
import { AddCurrencyForm } from '../forms/AddCurrencyForm';
import { EditCurrencyForm } from '../forms/EditCurrencyForm';
import { InviteUserForm } from '../forms/InviteUserForm';
import { EditUserForm } from '../forms/EditUserForm';
import { TeamCost, CompanyCost, Service, TeamMember, Tax, User, Currency } from '../../lib/types';

type SettingsSection = 'costs' | 'services' | 'team' | 'currency' | 'taxes' | 'users';

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('costs');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [costTab, setCostTab] = useState('team');

  // Local state for data
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [teamCosts, setTeamCosts] = useState<TeamCost[]>(mockCosts);
  const [companyCosts, setCompanyCosts] = useState<CompanyCost[]>(mockCompanyCosts);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [taxes, setTaxes] = useState<Tax[]>(mockTaxes);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const sections = [
    { id: 'costs' as const, label: 'Costs', icon: DollarSign, description: 'Manage team and company costs' },
    { id: 'services' as const, label: 'Services', icon: Package, description: 'Configure service catalog' },
    { id: 'team' as const, label: 'Team', icon: Users, description: 'Manage team members' },
    { id: 'currency' as const, label: 'Currency', icon: Coins, description: 'Set default currency' },
    { id: 'taxes' as const, label: 'Taxes', icon: Receipt, description: 'Configure tax rates' },
    { id: 'users' as const, label: 'Users & Roles', icon: UserCog, description: 'Manage user permissions' }
  ];

  const handleAddTeamCost = (data: { name: string; hourlyRate: number; weeklyHours: number; monthlyCost: number }) => {
    const newCost: TeamCost = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      isActive: true
    };
    setTeamCosts([...teamCosts, newCost]);
    setIsDialogOpen(false);
  };

  const handleAddCompanyCost = (data: { name: string; amount: number; type: 'fixed' | 'variable'; frequency: 'monthly' | 'yearly' }) => {
    const newCost: CompanyCost = {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };
    setCompanyCosts([...companyCosts, newCost]);
    setIsDialogOpen(false);
  };

  const handleAddService = (data: { name: string; category: string; defaultHourlyRate: number }) => {
    const newService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };
    setServices([...services, newService]);
    setIsDialogOpen(false);
  };

  const handleAddTeamMember = (data: { name: string; role: string; email: string; costId?: string }) => {
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };
    setTeamMembers([...teamMembers, newMember]);
    setIsDialogOpen(false);
  };

  const handleAddTax = (data: { name: string; rate: number; isDefault: boolean }) => {
    const newTax: Tax = {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };

    if (data.isDefault) {
      setTaxes(taxes.map(t => ({ ...t, isDefault: false })).concat(newTax));
    } else {
      setTaxes([...taxes, newTax]);
    }
    setIsDialogOpen(false);
  };

  const handleEditTax = (data: { name: string; rate: number; isDefault: boolean }) => {
    if (!editingTax) return;

    let updatedTaxes = taxes.map(t => t.id === editingTax.id ? { ...t, ...data } : t);

    if (data.isDefault) {
      updatedTaxes = updatedTaxes.map(t => ({
        ...t,
        isDefault: t.id === editingTax.id ? true : false
      }));
    }

    setTaxes(updatedTaxes);
    setIsDialogOpen(false);
    setEditingTax(null);
  };

  const handleDeleteTax = (id: string) => {
    setTaxes(taxes.filter(t => t.id !== id));
  };

  const handleAddCurrency = (data: { code: string; name: string; symbol: string }) => {
    const newCurrency: Currency = {
      ...data
    };
    setCurrencies([...currencies, newCurrency]);
    setIsDialogOpen(false);
  };

  const handleEditCurrency = (data: { code: string; name: string; symbol: string }) => {
    if (!editingCurrency) return;
    // Since code is the ID, if code changes we need to handle it carefully, but for now assuming code is editable but unique check is not strictly enforced here beyond basic logic
    setCurrencies(currencies.map(c => c.code === editingCurrency.code ? { ...data } : c));
    setIsDialogOpen(false);
    setEditingCurrency(null);
  };

  const handleDeleteCurrency = (code: string) => {
    setCurrencies(currencies.filter(c => c.code !== code));
  };

  const handleSetDefaultCurrency = (code: string) => {
    // In a real app, this would update a setting. For now, we'll just reorder or mark visually if we had a 'isDefault' prop on Currency, 
    // but Currency type doesn't have isDefault. It seems 'USD' is hardcoded as default in the render.
    // Let's assume the first one is default or we need to add isDefault to Currency type?
    // The mock data doesn't have isDefault. The render logic says: {curr.code === 'USD' && ...}
    // So we can't easily change default without changing the logic or the type.
    // For now, I will skip "Set Default" logic change unless I update the type.
    // I'll just stick to CRUD.
  };

  const handleInviteUser = (data: { email: string; role: string; message: string }) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.email.split('@')[0], // Placeholder name
      email: data.email,
      role: data.role as 'admin' | 'manager' | 'member'
    };
    // In a real app, we would send the invite here
    console.log('Inviting user:', data);
    setUsers([...users, newUser]); // Optimistically add user or show success message
    setIsDialogOpen(false);
  };

  const handleEditUser = (data: { role: string }) => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: data.role as any } : u));
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const renderDialogContent = () => {
    switch (activeSection) {
      case 'costs':
        return costTab === 'team'
          ? <AddCostForm onSubmit={handleAddTeamCost} onCancel={() => setIsDialogOpen(false)} />
          : <AddCompanyCostForm onSubmit={handleAddCompanyCost} onCancel={() => setIsDialogOpen(false)} />;
      case 'services':
        return <AddServiceForm onSubmit={handleAddService} onCancel={() => setIsDialogOpen(false)} />;
      case 'team':
        return <AddTeamMemberForm costs={teamCosts} onSubmit={handleAddTeamMember} onCancel={() => setIsDialogOpen(false)} />;
      case 'taxes':
        return editingTax
          ? <EditTaxForm tax={editingTax} onSubmit={handleEditTax} onCancel={() => { setIsDialogOpen(false); setEditingTax(null); }} />
          : <AddTaxForm onSubmit={handleAddTax} onCancel={() => setIsDialogOpen(false)} />;
      case 'currency':
        return editingCurrency
          ? <EditCurrencyForm currency={editingCurrency} onSubmit={handleEditCurrency} onCancel={() => { setIsDialogOpen(false); setEditingCurrency(null); }} />
          : <AddCurrencyForm onSubmit={handleAddCurrency} onCancel={() => setIsDialogOpen(false)} />;
      case 'users':
        return editingUser
          ? <EditUserForm user={editingUser} onSubmit={handleEditUser} onCancel={() => { setIsDialogOpen(false); setEditingUser(null); }} />
          : <InviteUserForm onSubmit={handleInviteUser} onCancel={() => setIsDialogOpen(false)} />;
      default:
        return <p>Form not implemented for this section.</p>;
    }
  };

  const getDialogTitle = () => {
    if (activeSection === 'costs') {
      return costTab === 'team' ? 'Add Team Cost Role' : 'Add Company Cost';
    }
    if (activeSection === 'users' && editingUser) {
      return 'Edit User Role';
    }
    if (activeSection === 'taxes' && editingTax) {
      return 'Edit Tax Rate';
    }
    if (activeSection === 'currency' && editingCurrency) {
      return 'Edit Currency';
    }
    return `Add New ${activeConfig?.label}`;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'costs':
        return (
          <div className="space-y-6">
            <div>
              <h3>Costs Management</h3>
              <p className="text-grey-600 mt-1">Manage your team roles and company operational costs</p>
            </div>

            <Tabs defaultValue="team" value={costTab} onValueChange={setCostTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Team Costs
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Costs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="team" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-grey-900 font-medium">Team Roles & Rates</h4>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary-500 hover:bg-primary-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
                  </Button>
                </div>

                <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-grey-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-grey-700">Role Name</th>
                        <th className="px-6 py-4 text-left text-grey-700">Hourly Rate</th>
                        <th className="px-6 py-4 text-left text-grey-700">Weekly Hours</th>
                        <th className="px-6 py-4 text-left text-grey-700">Monthly Cost</th>
                        <th className="px-6 py-4 text-left text-grey-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamCosts.map((cost) => (
                        <tr key={cost.id} className="border-t border-grey-200 hover:bg-grey-50 transition-colors">
                          <td className="px-6 py-4 text-grey-900 font-medium">{cost.name}</td>
                          <td className="px-6 py-4 text-grey-900">${cost.hourlyRate}/hr</td>
                          <td className="px-6 py-4 text-grey-700">{cost.weeklyHours} hrs</td>
                          <td className="px-6 py-4 text-grey-900">${cost.monthlyCost.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                                <Pencil className="w-4 h-4 text-grey-600" />
                              </button>
                              <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                                <Trash className="w-4 h-4 text-error-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="company" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-grey-900 font-medium">Fixed & Variable Costs</h4>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary-500 hover:bg-primary-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cost
                  </Button>
                </div>

                <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-grey-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-grey-700">Cost Name</th>
                        <th className="px-6 py-4 text-left text-grey-700">Type</th>
                        <th className="px-6 py-4 text-left text-grey-700">Frequency</th>
                        <th className="px-6 py-4 text-left text-grey-700">Amount</th>
                        <th className="px-6 py-4 text-left text-grey-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyCosts.map((cost) => (
                        <tr key={cost.id} className="border-t border-grey-200 hover:bg-grey-50 transition-colors">
                          <td className="px-6 py-4 text-grey-900 font-medium">{cost.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${cost.type === 'fixed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-purple-50 text-purple-700'
                              }`}>
                              {cost.type === 'fixed' ? 'Fixed' : 'Variable'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-grey-700 capitalize">{cost.frequency}</td>
                          <td className="px-6 py-4 text-grey-900">${cost.amount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                                <Pencil className="w-4 h-4 text-grey-600" />
                              </button>
                              <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                                <Trash className="w-4 h-4 text-error-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Services</h3>
                <p className="text-grey-600 mt-1">Manage your service catalog and default rates</p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-grey-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-grey-700">Service Name</th>
                    <th className="px-6 py-4 text-left text-grey-700">Category</th>
                    <th className="px-6 py-4 text-left text-grey-700">Default Rate</th>
                    <th className="px-6 py-4 text-left text-grey-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-t border-grey-200 hover:bg-grey-50 transition-colors">
                      <td className="px-6 py-4 text-grey-900">{service.name}</td>
                      <td className="px-6 py-4 text-grey-700">{service.category}</td>
                      <td className="px-6 py-4 text-grey-900">${service.defaultHourlyRate}/hr</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4 text-grey-600" />
                          </button>
                          <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                            <Trash className="w-4 h-4 text-error-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Team Members</h3>
                <p className="text-grey-600 mt-1">Manage your team and assign cost rates</p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-grey-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-grey-700">Name</th>
                    <th className="px-6 py-4 text-left text-grey-700">Role</th>
                    <th className="px-6 py-4 text-left text-grey-700">Email</th>
                    <th className="px-6 py-4 text-left text-grey-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-t border-grey-200 hover:bg-grey-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-grey-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-grey-700">{member.role}</td>
                      <td className="px-6 py-4 text-grey-700">{member.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4 text-grey-600" />
                          </button>
                          <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                            <Trash className="w-4 h-4 text-error-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'currency':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Currency Settings</h3>
                <p className="text-grey-600 mt-1">Select your default currency for new quotes</p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Currency
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currencies.map((curr) => (
                <div
                  key={curr.code}
                  className="bg-white rounded-xl border border-grey-200 p-6 hover:border-primary-500 transition-colors relative group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-1">{curr.symbol}</div>
                      <h4 className="text-grey-900">{curr.name}</h4>
                      <p className="text-grey-600 text-xs mt-1">{curr.code}</p>
                    </div>
                    {curr.code === 'USD' && (
                      <span className="px-2 py-1 rounded-full bg-primary-500 text-white text-xs">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      className="p-1.5 hover:bg-grey-100 rounded-lg text-grey-500 hover:text-primary-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCurrency(curr);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {curr.code !== 'USD' && (
                      <button
                        className="p-1.5 hover:bg-grey-100 rounded-lg text-grey-500 hover:text-error-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCurrency(curr.code);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'taxes':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Tax Rates</h3>
                <p className="text-grey-600 mt-1">Configure tax rates for your quotes</p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tax Rate
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-grey-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-grey-700">Name</th>
                    <th className="px-6 py-4 text-left text-grey-700">Rate</th>
                    <th className="px-6 py-4 text-left text-grey-700">Default</th>
                    <th className="px-6 py-4 text-left text-grey-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taxes.map((tax) => (
                    <tr key={tax.id} className="border-t border-grey-200 hover:bg-grey-50 transition-colors">
                      <td className="px-6 py-4 text-grey-900">{tax.name}</td>
                      <td className="px-6 py-4 text-grey-900">{tax.rate}%</td>
                      <td className="px-6 py-4">
                        {tax.isDefault && (
                          <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-700 text-xs">
                            Default
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
                            onClick={() => {
                              setEditingTax(tax);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-grey-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
                            onClick={() => handleDeleteTax(tax.id)}
                          >
                            <Trash className="w-4 h-4 text-error-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Users & Roles</h3>
                <p className="text-grey-600 mt-1">Manage user access and permissions</p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-grey-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-grey-700">User</th>
                    <th className="px-6 py-4 text-left text-grey-700">Email</th>
                    <th className="px-6 py-4 text-left text-grey-700">Role</th>
                    <th className="px-6 py-4 text-left text-grey-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="border-t border-grey-200 hover:bg-grey-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-grey-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-grey-700">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                          ? 'bg-error-50 text-error-700'
                          : user.role === 'manager'
                            ? 'bg-primary-50 text-primary-700'
                            : 'bg-grey-100 text-grey-700'
                          }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
                            onClick={() => {
                              setEditingUser(user);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-grey-600" />
                          </button>
                          {user.role !== 'admin' && (
                            <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
                              <Trash className="w-4 h-4 text-error-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  const activeConfig = sections.find(s => s.id === activeSection);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-grey-200 p-2" style={{ boxShadow: 'var(--elevation-2)' }}>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-colors text-left ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-grey-700 hover:bg-grey-50'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{section.label}</p>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-primary-600' : 'text-grey-600'}`}>
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-3">
        {renderContent()}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderDialogContent()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
