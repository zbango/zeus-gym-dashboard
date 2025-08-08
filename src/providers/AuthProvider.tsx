import { PropsWithChildren, use } from 'react';
import AuthJwtProvider, { AuthJwtContext } from './auth-provider/AuthJwtProvider';

// import Auth0Provider, { Auth0Context } from './auth-provider/Auth0Provider';
// import AuthFirebaseProvider, { AuthFirebaseContext } from './auth-provider/AuthFirebaseProvider';

const AuthMethodProvider = AuthJwtProvider;
const AuthMethodContext = AuthJwtContext;

// const AuthMethodProvider = Auth0Provider;
// const AuthMethodContext = Auth0Context;

// const AuthMethodProvider = AuthFirebaseProvider;
// const AuthMethodContext = AuthFirebaseContext;

const AuthProvider = ({ children }: PropsWithChildren) => {
  return (
    <AuthMethodProvider>
      {children}
      {/* <SocialAuthProvider>{children}</SocialAuthProvider> */}
    </AuthMethodProvider>
  );
};

export const useAuth = () => use(AuthMethodContext);

export default AuthProvider;
