import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <p className="text-white/50 text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) {
    sessionStorage.setItem('auth_return_to', location.pathname);
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
