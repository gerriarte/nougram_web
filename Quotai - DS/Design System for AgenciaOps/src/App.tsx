import { useState } from 'react';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { OnboardingPage } from './components/pages/OnboardingPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { CreateQuotePage } from './components/pages/CreateQuotePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { OrganizationSettingsPage } from './components/pages/OrganizationSettingsPage';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from './components/ui/sonner';
import { mockOrganizations } from './lib/mock-data';

type Page = 'login' | 'register' | 'onboarding' | 'dashboard' | 'projects' | 'create-quote' | 'settings' | 'org-settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentOrgId, setCurrentOrgId] = useState(mockOrganizations[0].id);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentPage('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleOrgChange = (orgId: string) => {
    setCurrentOrgId(orgId);
    console.log('Switched to org:', orgId);
  };

  // Page titles, descriptions, and help content
  const pageConfig = {
    dashboard: {
      title: 'Dashboard',
      description: 'Overview of your agency performance',
      helpContent: {
        title: 'Dashboard Guide',
        description: 'Welcome to your agency dashboard. Here you can see a high-level overview of your business performance.',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Key Metrics</h4>
              <p className="text-sm text-grey-600">Track your total revenue, active projects, and win rate at a glance.</p>
            </div>
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Recent Activity</h4>
              <p className="text-sm text-grey-600">See the latest updates on your quotes and projects.</p>
            </div>
          </div>
        )
      }
    },
    projects: {
      title: 'Projects',
      description: 'Manage your quotes and projects',
      helpContent: {
        title: 'Projects Guide',
        description: 'Manage all your client quotes and projects in one place.',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Project Status</h4>
              <ul className="list-disc pl-4 text-sm text-grey-600 space-y-1">
                <li><strong>Draft:</strong> Quotes being worked on.</li>
                <li><strong>Sent:</strong> Quotes sent to clients.</li>
                <li><strong>Won:</strong> Projects accepted by clients.</li>
                <li><strong>Lost:</strong> Projects declined by clients.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Actions</h4>
              <p className="text-sm text-grey-600">Use the action buttons in the table to View (Eye), Edit (Pencil), or Delete (Trash) a quote.</p>
            </div>
          </div>
        )
      }
    },
    'create-quote': {
      title: 'Create Quote',
      description: 'Build a new project quote',
      helpContent: {
        title: 'Creating a Quote',
        description: 'Follow these steps to create a comprehensive quote for your client.',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-grey-900 mb-1">1. Project Details</h4>
              <p className="text-sm text-grey-600">Enter the project name and client information.</p>
            </div>
            <div>
              <h4 className="font-medium text-grey-900 mb-1">2. Add Services</h4>
              <p className="text-sm text-grey-600">Select services from your catalog. You can adjust hours and rates for this specific quote.</p>
            </div>
            <div>
              <h4 className="font-medium text-grey-900 mb-1">3. Review Financials</h4>
              <p className="text-sm text-grey-600">Check the calculated subtotal, taxes, and margin. Ensure your margin meets your targets.</p>
            </div>
          </div>
        )
      }
    },
    settings: {
      title: 'Settings',
      description: 'Configure your agency operations',
      helpContent: {
        title: 'Agency Settings',
        description: 'Configure the core operational data for your agency.',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Costs</h4>
              <p className="text-sm text-grey-600">Define your recurring overhead costs (software, rent, etc.) to calculate accurate margins.</p>
            </div>
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Services</h4>
              <p className="text-sm text-grey-600">Build your service catalog with default rates and descriptions.</p>
            </div>
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Team</h4>
              <p className="text-sm text-grey-600">Manage your team members, their roles, and hourly costs.</p>
            </div>
          </div>
        )
      }
    },
    'org-settings': {
      title: 'Organization',
      description: 'Manage organization profile and billing',
      helpContent: {
        title: 'Organization Settings',
        description: 'Manage your organization profile and members.',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-grey-900 mb-1">General</h4>
              <p className="text-sm text-grey-600">Update your company logo and name.</p>
            </div>
            <div>
              <h4 className="font-medium text-grey-900 mb-1">Users</h4>
              <p className="text-sm text-grey-600">Invite new team members and manage their access roles.</p>
            </div>
          </div>
        )
      }
    }
  };

  // Public Routes
  if (currentPage === 'register') {
    return (
      <>
        <RegisterPage
          onRegister={handleRegister}
          onLoginClick={() => setCurrentPage('login')}
        />
        <Toaster />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setCurrentPage('register')}
            className="text-sm text-grey-600 hover:text-primary-600 underline"
          >
            Go to Register
          </button>
        </div>
        <Toaster />
      </>
    );
  }

  // Onboarding Route
  if (currentPage === 'onboarding') {
    return (
      <>
        <OnboardingPage onComplete={handleOnboardingComplete} />
        <Toaster />
      </>
    );
  }

  // Authenticated Routes
  const config = pageConfig[currentPage as keyof typeof pageConfig];

  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        title={config?.title || 'Nougram'}
        description={config?.description}
        currentOrgId={currentOrgId}
        onOrgChange={handleOrgChange}
        helpContent={config?.helpContent}
      >
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'projects' && <ProjectsPage onNavigate={handleNavigate} />}
        {currentPage === 'create-quote' && <CreateQuotePage onNavigate={handleNavigate} />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'org-settings' && <OrganizationSettingsPage />}
      </AppLayout>
      <Toaster />
    </>
  );
}
