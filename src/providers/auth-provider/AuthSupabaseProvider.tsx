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

type StaffSummary = {
  id: string;
  name: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
};

interface AuthSupabaseContextInterface {
  user: User | null;
  session: Session | null;
  isInitializing: boolean;
  profile: { gym_id: string; role: string } | null;
  isProfileLoading: boolean;
  staff: StaffSummary | null;
  isStaffLoading: boolean;
  signInWithPassword: (params: { email: string; password: string }) => Promise<void>;
  signUpWithPassword: (params: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthSupabaseContext = createContext({} as AuthSupabaseContextInterface);

const AuthSupabaseProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [profile, setProfile] = useState<{ gym_id: string; role: string } | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [staff, setStaff] = useState<StaffSummary | null>(null);
  const [isStaffLoading, setIsStaffLoading] = useState(false);

  const DEFAULT_GYM_ID =
    (import.meta.env.VITE_DEFAULT_GYM_ID as string | undefined) ||
    '00000000-0000-0000-0000-000000000000';

  const ensureAndLoadProfile = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser) {
        setProfile(null);
        setStaff(null);
        return;
      }
      setIsProfileLoading(true);
      try {
        // Ensure a user_profiles row exists and aligns to the default gym
        await supabase.rpc('ensure_profile', { _gym: DEFAULT_GYM_ID, _role: 'admin' });
      } catch (error) {
        console.error('Error ensuring profile', error);
        // swallow; we will still attempt to read profile
      }
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('gym_id, role')
          .eq('id', currentUser.id)
          .single();
        if (error) throw error;
        setProfile(data as { gym_id: string; role: string });
      } catch (error) {
        console.error('Error reading profile', error);
        setProfile(null);
      } finally {
        setIsProfileLoading(false);
      }

      // Ensure staff and load staff row
      setIsStaffLoading(true);
      try {
        await supabase.rpc('ensure_staff');
      } catch (error) {
        console.error('Error ensuring staff', error);
        // ignore
      }

      try {
        const gymId = (
          await supabase.from('user_profiles').select('gym_id').eq('id', currentUser.id).single()
        ).data?.gym_id as string | undefined;
        if (!gymId) throw new Error('missing gym_id');
        const { data: staffRow, error: staffErr } = await supabase
          .from('staff')
          .select('id,name,role,phone,email')
          .eq('user_id', currentUser.id)
          .eq('gym_id', gymId)
          .maybeSingle();
        if (staffErr) throw staffErr;
        setStaff((staffRow as unknown as StaffSummary) ?? null);
      } catch (error) {
        console.error('Error reading staff', error);
        setStaff(null);
      } finally {
        setIsStaffLoading(false);
      }
    },
    [DEFAULT_GYM_ID],
  );

  useEffect(() => {
    console.log('useEffect');
    let isMounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        // Kick off profile load on initial session
        void ensureAndLoadProfile(data.session?.user ?? null);
      })
      .finally(() => {
        if (isMounted) setIsInitializing(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      void ensureAndLoadProfile(newSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [ensureAndLoadProfile]);

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
    () => ({
      user,
      session,
      isInitializing,
      profile,
      isProfileLoading,
      staff,
      isStaffLoading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [
      user,
      session,
      isInitializing,
      profile,
      isProfileLoading,
      staff,
      isStaffLoading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    ],
  );

  return <AuthSupabaseContext value={value}>{children}</AuthSupabaseContext>;
};

export const useSupabaseAuth = () => use(AuthSupabaseContext);

export default AuthSupabaseProvider;
