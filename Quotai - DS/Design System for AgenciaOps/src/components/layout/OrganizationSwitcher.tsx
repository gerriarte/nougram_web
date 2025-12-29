import { useState } from 'react';
import { ChevronDown, Check, Plus, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { mockOrganizations, Organization } from '../../lib/mock-data';

interface OrganizationSwitcherProps {
    currentOrgId: string;
    onOrgChange: (orgId: string) => void;
    onNavigate?: (page: string) => void;
}

export function OrganizationSwitcher({ currentOrgId, onOrgChange, onNavigate }: OrganizationSwitcherProps) {
    const currentOrg = mockOrganizations.find(o => o.id === currentOrgId) || mockOrganizations[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 px-2 gap-2 hover:bg-grey-100">
                    <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {currentOrg.name.charAt(0)}
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-medium leading-none text-grey-900">{currentOrg.name}</p>
                        <p className="text-xs text-grey-500 capitalize">{currentOrg.plan} Plan</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-grey-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs text-grey-500 font-normal">Organizations</DropdownMenuLabel>
                {mockOrganizations.map((org) => (
                    <DropdownMenuItem
                        key={org.id}
                        onClick={() => onOrgChange(org.id)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <div className="w-6 h-6 rounded bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                                {org.name.charAt(0)}
                            </div>
                            <span className={`flex-1 ${org.id === currentOrgId ? 'font-medium' : ''}`}>
                                {org.name}
                            </span>
                            {org.id === currentOrgId && <Check className="w-4 h-4 text-primary-600" />}
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Organization
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onNavigate && onNavigate('org-settings')}
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Organizations
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
