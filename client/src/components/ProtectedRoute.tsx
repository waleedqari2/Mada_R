import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Check role if required
  if (requiredRole) {
    if (requiredRole === 'admin' && user?.role !== 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">غير مصرح</h1>
            <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
          </div>
        </div>
      );
    }

    if (requiredRole === 'manager' && user?.role !== 'admin' && user?.role !== 'manager') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">غير مصرح</h1>
            <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
