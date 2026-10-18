import { useState } from 'react';
import { router } from 'expo-router';
import { getSupabase } from '../lib/supabase';
import { isAdult } from '../lib/age';
import { useAuth } from './auth-provider';
import { Action, AuthPage, ErrorNotice, Field } from './auth-ui';

export function EmailAuthScreen({ signup }: { signup: boolean }) {
  const { setPending } = useAuth();
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    if (busy) return;
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Enter a valid email address.');
      return;
    }
    if (signup && !isAdult(birthdate)) {
      setError(
        'You must be 18 or older. Enter a valid birth date as YYYY-MM-DD.',
      );
      return;
    }
    setBusy(true);
    try {
      const { error: sendError } = await getSupabase().auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: signup,
          ...(signup ? { data: { birthdate } } : {}),
        },
      });
      if (sendError) {
        setError(
          sendError.status === 429
            ? 'Too many requests. Wait a few minutes before trying again.'
            : 'We could not send a code. Check your connection and email. For a new account, use Create account.',
        );
        return;
      }
      setPending({
        email: normalized,
        signup,
        ...(signup ? { birthdate } : {}),
      });
      router.push('/verify');
    } catch {
      setError(
        'We could not reach sign-in. Check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthPage
      title={signup ? 'Make yourself at home.' : 'Welcome back.'}
      subtitle="We’ll email you a six-digit code. No password to remember."
    >
      <Field
        label="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!busy}
      />
      {signup && (
        <Field
          label="Date of birth (YYYY-MM-DD)"
          placeholder="1998-04-23"
          value={birthdate}
          onChangeText={setBirthdate}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          editable={!busy}
        />
      )}
      <ErrorNotice message={error} />
      <Action title="Send code" busy={busy} onPress={() => void submit()} />
      <Action
        title="Back"
        secondary
        disabled={busy}
        onPress={() => router.replace('/welcome')}
      />
    </AuthPage>
  );
}
