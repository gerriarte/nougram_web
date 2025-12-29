import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { PageGuide } from '../ui/PageGuide';
import { ReactNode } from 'react';

interface AppHeaderProps {
  title: string;
  description?: string;
  currentOrgId?: string;
  onOrgChange?: (orgId: string) => void;
  onNavigate: (page: string) => void;
  helpContent?: {
    title: string;
    description?: string;
    content?: ReactNode;
  };
}

export function AppHeader({
  title,
  description,
  currentOrgId,
  onOrgChange,
  onNavigate,
  helpContent
}: AppHeaderProps) {
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
            placeholder="Search..."
            className="pl-9 bg-grey-50 border-grey-200 focus:bg-white transition-colors"
          />
        </div>

        <div className="h-8 w-px bg-grey-200 mx-2" />

        {/* Organization Switcher */}
        <OrganizationSwitcher
          currentOrgId={currentOrgId}
          onOrgChange={onOrgChange}
          onNavigate={onNavigate}
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-grey-500 hover:text-primary-600 hover:bg-primary-50">
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-grey-500 hover:text-primary-600 hover:bg-primary-50"
            onClick={() => onNavigate('settings')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
