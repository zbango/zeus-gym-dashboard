import {
  PropsWithChildren,
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import supabase from 'lib/supabaseClient';

interface AuthSupabaseContextInterface {
  user: User | null;
  session: Session | null;
  isInitializing: boolean;
  signInWithPassword: (params: { email: string; password: string }) => Promise<void>;
  signUpWithPassword: (params: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthSupabaseContext = createContext({} as AuthSupabaseContextInterface);

const AuthSupabaseProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      })
      .finally(() => {
        if (isMounted) setIsInitializing(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({ user, session, isInitializing, signInWithPassword, signUpWithPassword, signOut }),
    [user, session, isInitializing, signInWithPassword, signUpWithPassword, signOut],
  );

  return <AuthSupabaseContext value={value}>{children}</AuthSupabaseContext>;
};

export const useSupabaseAuth = () => use(AuthSupabaseContext);

export default AuthSupabaseProvider;
