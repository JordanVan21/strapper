import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createSecureSessionStorage } from './secure-session-storage';

// Web previews keep sessions in memory; native sessions use the OS secure store.
// Never fall back to unencrypted storage if secure persistence fails.
const webSession = new Map<string, string>();

const nativeStorage = createSecureSessionStorage({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) =>
    SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return webSession.get(key) ?? null;
    return nativeStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      webSession.set(key, value);
      return;
    }
    await nativeStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      webSession.delete(key);
      return;
    }
    await nativeStorage.removeItem(key);
  },
};
