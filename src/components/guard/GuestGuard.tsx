import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from 'providers/AuthProvider';
import { rootPaths } from 'routes/paths';

const GuestGuard = ({ children }: PropsWithChildren) => {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return null;
  return user ? <Navigate to={rootPaths.root} replace /> : children;
};

export default GuestGuard;
