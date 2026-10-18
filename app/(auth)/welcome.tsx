import { router } from 'expo-router';
import { Action, AuthPage } from '@/src/components/auth-ui';
export default function Welcome() {
  return (
    <AuthPage
      title={'Your people.\nYour space.'}
      subtitle="A women-centered space for queer women and nonbinary people, including trans women. You must be 18 or older to join."
    >
      <Action title="Create account" onPress={() => router.push('/sign-up')} />
      <Action
        title="Sign in"
        secondary
        onPress={() => router.push('/sign-in')}
      />
    </AuthPage>
  );
}
