import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthRefresh } from '@/src/hooks/use-auth-refresh';
import { AuthProvider, useAuth } from '@/src/components/auth-provider';
import { Action, AuthPage, ErrorNotice } from '@/src/components/auth-ui';
import { ActivityIndicator } from 'react-native';
import { initializeSentry, Sentry } from '@/src/lib/sentry';

initializeSentry();

function Navigation() {
  const { session, loading, error, retry } = useAuth();
  useAuthRefresh();
  if (loading)
    return (
      <AuthPage title="Opening your space…">
        <ActivityIndicator
          accessibilityLabel="Restoring session"
          color="#274C3D"
        />
      </AuthPage>
    );
  if (error)
    return (
      <AuthPage title="Let’s reconnect.">
        <ErrorNotice message={error} />
        <Action title="Retry" onPress={retry} />
      </AuthPage>
    );
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(member)" />
      </Stack.Protected>
    </Stack>
  );
}
function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Navigation />
    </AuthProvider>
  );
}
export default Sentry.wrap(RootLayout);
