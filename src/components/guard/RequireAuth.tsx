import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSupabaseAuth } from 'providers/auth-provider/AuthSupabaseProvider';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

const RequireAuth = ({ children }: PropsWithChildren) => {
  const { user, isInitializing, profile, isProfileLoading, staff, isStaffLoading } =
    useSupabaseAuth();
  const location = useLocation();

  const isBootstrapping =
    isInitializing ||
    ((profile === null || profile === undefined) && isProfileLoading) ||
    ((staff === null || staff === undefined) && isStaffLoading);

  if (isBootstrapping) return <PageLoader />;
  if (!user) return <Navigate to={paths.defaultJwtLogin} state={{ from: location }} replace />;
  return children;
};

export default RequireAuth;
