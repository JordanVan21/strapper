import { useEffect, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { useAuth } from '@/src/components/auth-provider';
import { Action, AuthPage, ErrorNotice, Field } from '@/src/components/auth-ui';
import { getSupabase } from '@/src/lib/supabase';

export default function Verify() {
  const { pending, setPending } = useAuth();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(60);
  useEffect(() => {
    const timer = setInterval(
      () => setRemaining((n) => Math.max(0, n - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);
  if (!pending) return <Redirect href="/welcome" />;
  const login = pending;
  async function verify() {
    if (busy) return;
    setError(null);
    if (!/^\d{6}$/.test(token)) {
      setError('Enter the six-digit code from your email.');
      return;
    }
    setBusy(true);
    try {
      const { error: verifyError } = await getSupabase().auth.verifyOtp({
        email: login.email,
        token,
        type: 'email',
      });
      if (verifyError)
        setError(
          'That code is invalid or expired. Check the latest email or request a new code.',
        );
    } catch {
      setError(
        'We could not finish signing in. Check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (busy || remaining) return;
    setBusy(true);
    setError(null);
    try {
      const { error: sendError } = await getSupabase().auth.signInWithOtp({
        email: login.email,
        options: {
          shouldCreateUser: login.signup,
          ...(login.signup ? { data: { birthdate: login.birthdate } } : {}),
        },
      });
      if (sendError)
        setError(
          'We could not resend the code. Wait a few minutes and try again.',
        );
      else {
        setRemaining(60);
        setToken('');
      }
    } catch {
      setError('Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthPage
      title="Check your inbox."
      subtitle={`Enter the code sent to ${login.email}. Use the most recent email.`}
    >
      <Field
        label="Six-digit code"
        value={token}
        onChangeText={(value) => setToken(value.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        editable={!busy}
      />
      <ErrorNotice message={error} />
      <Action
        title="Verify and continue"
        busy={busy}
        onPress={() => void verify()}
      />
      <Action
        title={remaining ? `Resend in ${remaining}s` : 'Resend code'}
        secondary
        disabled={busy || remaining > 0}
        onPress={() => void resend()}
      />
      <Action
        title="Use another email"
        secondary
        disabled={busy}
        onPress={() => {
          setPending(null);
          router.replace(login.signup ? '/sign-up' : '/sign-in');
        }}
      />
    </AuthPage>
  );
}
