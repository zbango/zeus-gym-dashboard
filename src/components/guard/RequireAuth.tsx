import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSupabaseAuth } from 'providers/auth-provider/AuthSupabaseProvider';
import paths from 'routes/paths';

const RequireAuth = ({ children }: PropsWithChildren) => {
  const { user, isInitializing } = useSupabaseAuth();
  const location = useLocation();

  if (isInitializing) return null; // or a loader component
  if (!user) return <Navigate to={paths.defaultJwtLogin} state={{ from: location }} replace />;
  return children;
};

export default RequireAuth;
