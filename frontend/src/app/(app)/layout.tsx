"use client";

import { usePathname } from 'next/navigation';
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useGetCurrentUser } from '@/lib/queries';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: currentUser } = useGetCurrentUser();
  const isOnboarding = pathname === '/onboarding';

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname?.startsWith('/dashboard')) return 'Panel';
    if (pathname?.startsWith('/projects')) return 'Proyectos';
    if (pathname?.startsWith('/settings')) return 'Configuración';
    if (pathname?.startsWith('/admin/support')) return 'Soporte';
    if (pathname?.startsWith('/admin/maintenance')) return 'Mantenimiento';
    if (pathname?.startsWith('/admin')) return 'Administración';
    return 'Nougram';
  };

  return (
    <AuthGuard>
      <ErrorBoundary>
        {!isOnboarding && (
          <div className="flex h-screen overflow-hidden bg-grey-50">
            <AppSidebar currentOrgId={currentUser?.organization_id} />
            <div className="flex-1 flex flex-col ml-64">
              <AppHeader
                title={getPageTitle()}
                currentOrgId={currentUser?.organization_id}
                onOrgChange={(orgId) => {
                  // Handle org change if needed
                  console.log('Org change:', orgId);
                }}
              />
              <main className="flex-1 overflow-y-auto pt-16 p-6" role="main">
                {children}
              </main>
            </div>
          </div>
        )}
        {isOnboarding && (
          <div className="min-h-screen bg-grey-50">
            {children}
          </div>
        )}
      </ErrorBoundary>
    </AuthGuard>
  );
}
