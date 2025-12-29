import { LayoutDashboard, FolderKanban, Settings, DollarSign, Users, Package, Building2 } from 'lucide-react';
import { mockOrganizations } from '../../lib/mock-data';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentOrgId?: string;
}

export function AppSidebar({ currentPage, onNavigate, currentOrgId }: AppSidebarProps) {
  const currentOrg = mockOrganizations.find(o => o.id === currentOrgId);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-grey-200 fixed left-0 top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="h-16 px-6 flex items-center border-b border-grey-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-primary-700">AgenciaOps</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
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
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-grey-200 space-y-4">
        {/* Organization Card */}
        {currentOrg && (
          <div className="bg-grey-50 rounded-lg p-3 border border-grey-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white border border-grey-200 flex items-center justify-center text-grey-700">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-grey-900 truncate">{currentOrg.name}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                  {currentOrg.plan}
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('org-settings')}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium w-full text-left"
            >
              Organization Settings
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700">AT</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-grey-900 truncate">Alex Thompson</p>
            <p className="text-grey-600 text-xs">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
