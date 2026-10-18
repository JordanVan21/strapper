import { Redirect } from 'expo-router';
import { useAuth } from '@/src/components/auth-provider';
export default function HomeScreen() {
  const { session } = useAuth();
  return <Redirect href={session ? '/home' : '/welcome'} />;
}
