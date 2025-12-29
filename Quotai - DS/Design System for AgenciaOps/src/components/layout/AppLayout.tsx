import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  title: string;
  description?: string;
  currentOrgId?: string;
  onOrgChange?: (orgId: string) => void;
  helpContent?: {
    title: string;
    description?: string;
    content?: ReactNode;
  };
}

export function AppLayout({
  children,
  currentPage,
  onNavigate,
  title,
  description,
  currentOrgId,
  onOrgChange,
  helpContent
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-grey-50">
      <AppSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        currentOrgId={currentOrgId}
      />
      <AppHeader
        title={title}
        description={description}
        currentOrgId={currentOrgId}
        onOrgChange={onOrgChange}
        onNavigate={onNavigate}
        helpContent={helpContent}
      />

      <main className="ml-64 pt-16">
        <div className="p-6 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
