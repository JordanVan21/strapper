import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Action, AuthPage, ErrorNotice } from '@/src/components/auth-ui';
import { Sentry, sentryEnabled } from '@/src/lib/sentry';

export default function Debug() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!__DEV__) return <Redirect href="/home" />;
  async function sendTest() {
    setBusy(true);
    setStatus(null);
    try {
      try {
        throw new Error('Strapper debug test');
      } catch (error) {
        Sentry.captureException(error);
      }
      const delivered = await Sentry.flush();
      setStatus(
        delivered
          ? 'Test sent. Confirm it appears in Sentry Issues.'
          : 'Delivery timed out. Check your connection and DSN.',
      );
    } catch {
      setStatus('Could not send the test event. Check Sentry configuration.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthPage
      title="Developer tools"
      subtitle={
        sentryEnabled
          ? 'Sentry is configured. This sends a test error with no account details.'
          : 'Add EXPO_PUBLIC_SENTRY_DSN to .env and restart Expo to enable error reporting.'
      }
    >
      <ErrorNotice message={status} />
      <Action
        title="Send Sentry test error"
        busy={busy}
        disabled={!sentryEnabled}
        onPress={() => void sendTest()}
      />
      <Action title="Back" secondary onPress={() => router.replace('/home')} />
    </AuthPage>
  );
}
