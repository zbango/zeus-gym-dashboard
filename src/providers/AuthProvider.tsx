import { PropsWithChildren, use } from 'react';
import AuthSupabaseProvider, { AuthSupabaseContext } from './auth-provider/AuthSupabaseProvider';

const AuthMethodProvider = AuthSupabaseProvider;
const AuthMethodContext = AuthSupabaseContext;

const AuthProvider = ({ children }: PropsWithChildren) => {
  return <AuthMethodProvider>{children}</AuthMethodProvider>;
};

export const useAuth = () => use(AuthMethodContext);

export default AuthProvider;
