import 'react-native-url-polyfill/auto';
import {
  createClient,
  processLock,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { authStorage } from './auth-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publicKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && publicKey);
let client: SupabaseClient | undefined;

// Lazy initialization keeps the placeholder usable before .env is configured.
export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!url || !publicKey) {
    throw new Error(
      'Set the Supabase project URL and public key in your local .env, then restart Expo.',
    );
  }
  if (publicKey.startsWith('sb_secret_')) {
    throw new Error(
      'Use a Supabase public key in the app, never a secret key.',
    );
  }
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname === 'supabase.com' || parsedUrl.pathname !== '/') {
    throw new Error(
      'Use the project API URL from Connect, not a Supabase dashboard page URL.',
    );
  }
  client = createClient(url, publicKey, {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });
  return client;
}
