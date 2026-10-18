import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export function useAuthRefresh() {
  useEffect(() => {
    if (Platform.OS === 'web' || !isSupabaseConfigured) return;
    // AuthProvider displays a recoverable error for invalid configuration.
    let auth: ReturnType<typeof getSupabase>['auth'];
    try {
      auth = getSupabase().auth;
    } catch {
      return;
    }
    const update = (state: string | null | undefined) => {
      if (state === 'active') auth.startAutoRefresh();
      else auth.stopAutoRefresh();
    };
    update(AppState.currentState);
    const subscription = AppState.addEventListener('change', update);
    return () => {
      subscription.remove();
      auth.stopAutoRefresh();
    };
  }, []);
}
