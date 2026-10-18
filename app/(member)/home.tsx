import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { Action, AuthPage, ErrorNotice, ui } from '@/src/components/auth-ui';
import { useAuth } from '@/src/components/auth-provider';
import { getSupabase } from '@/src/lib/supabase';
export default function Home() {
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function signOut() {
    setBusy(true);
    setError(null);
    try {
      const { error: signOutError } = await getSupabase().auth.signOut();
      if (signOutError)
        setError('We could not sign you out. Check your connection and retry.');
    } catch {
      setError('We could not sign you out. Please retry.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthPage
      title="You’re home."
      subtitle="You’re signed in. Your profile and nearby connections are coming next."
    >
      <Text style={ui.copy}>{session?.user.email}</Text>
      <ErrorNotice message={error} />
      <Action title="Sign out" busy={busy} onPress={() => void signOut()} />
      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open debug menu"
          onLongPress={() => router.push('/debug')}
          delayLongPress={1500}
        >
          <Text style={ui.footer}>Development build · hold for tools</Text>
        </Pressable>
      )}
    </AuthPage>
  );
}
