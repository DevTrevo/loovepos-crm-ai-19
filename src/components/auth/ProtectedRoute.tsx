
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('ProtectedRoute state:', { loading, user: user?.id });
    
    // Only redirect if we're sure there's no user and loading is complete
    if (!loading && !user) {
      console.log('Redirecting to auth page - no user found');
      window.location.href = '/auth';
    }
  }, [user, loading]);

  // Show loading while authentication state is being determined
  if (loading) {
    console.log('ProtectedRoute: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Carregando...</p>
          <p className="text-sm text-gray-400">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    console.log('ProtectedRoute: No user, showing nothing (redirect in progress)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};
