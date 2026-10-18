import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export type PendingLogin = {
  email: string;
  signup: boolean;
  birthdate?: string;
};
type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  pending: PendingLogin | null;
  setPending: (value: PendingLogin | null) => void;
  retry: () => void;
};
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingLogin | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let changed = false;
    let unsubscribe: (() => void) | undefined;
    void Promise.resolve()
      .then(() => {
        if (!active) return;
        const client = getSupabase();
        const { data } = client.auth.onAuthStateChange(
          (_event, nextSession) => {
            if (!active) return;
            changed = true;
            setSession(nextSession);
            if (nextSession) setPending(null);
          },
        );
        unsubscribe = () => data.subscription.unsubscribe();
        client.auth
          .getSession()
          .then(({ data, error: sessionError }) => {
            if (!active) return;
            if (sessionError)
              setError(
                'We could not restore your session. Check your connection and retry.',
              );
            else if (!changed) setSession(data.session);
          })
          .catch(() => {
            if (active)
              setError(
                'Secure sign-in storage could not be opened. Please retry.',
              );
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      })
      .catch(() => {
        if (!active) return;
        setError(
          'Supabase is not configured correctly. Check the local .env file and restart Expo.',
        );
        setLoading(false);
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [attempt]);
  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        error,
        pending,
        setPending,
        retry: () => {
          setLoading(true);
          setError(null);
          setAttempt((n) => n + 1);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider is missing');
  return auth;
}
