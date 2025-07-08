import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'customer' | 'vendor' | 'admin';
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has required role
  if (requiredRole && profile?.role !== requiredRole) {
    console.log(`User role: ${profile?.role}, Required: ${requiredRole}`);
    
    // Redirect based on user role
    const roleRedirects = {
      customer: '/dashboard',
      vendor: '/vendor',
      admin: '/admin'
    };
    
    const redirectPath = roleRedirects[profile?.role || 'customer'];
    console.log(`Redirecting to: ${redirectPath}`);
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};