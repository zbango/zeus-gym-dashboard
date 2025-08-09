import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSupabaseAuth } from 'providers/auth-provider/AuthSupabaseProvider';
import paths from 'routes/paths';

interface RequireRoleProps {
  roles: string[]; // allowed roles
}

const RequireRole = ({ roles, children }: PropsWithChildren<RequireRoleProps>) => {
  const { user, isInitializing, profile, staff, isStaffLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isInitializing || isStaffLoading) return null;
  if (!user) return <Navigate to={paths.defaultJwtLogin} state={{ from: location }} replace />;

  // Prefer staff.role as the source of truth for authorization
  const userRole = staff?.role || profile?.role;
  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to={paths.defaultLoggedOut} replace />;
  }

  return children;
};

export default RequireRole;
