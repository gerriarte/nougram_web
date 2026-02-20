'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api-client';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Redirects to /login when there is no JWT token.
 * Use for all protected routes.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!getToken()) {
      router.replace('/login');
    }
  }, [router]);

  if (typeof window !== 'undefined' && !getToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="text-gray-500 font-medium">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
