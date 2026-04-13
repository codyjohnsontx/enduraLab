import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

const LARGE_VALUE_PREFIX = "__secure_blob__:";

const secureStorage = {
  async getItem(key: string) {
    const value = await SecureStore.getItemAsync(key);

    if (!value) {
      return null;
    }

    if (value.startsWith(LARGE_VALUE_PREFIX)) {
      const blobKey = value.slice(LARGE_VALUE_PREFIX.length);
      return AsyncStorage.getItem(blobKey);
    }

    return value;
  },
  async setItem(key: string, value: string) {
    if (value.length > 1800) {
      const blobKey = `${key}:blob`;
      await AsyncStorage.setItem(blobKey, value);
      await SecureStore.setItemAsync(key, `${LARGE_VALUE_PREFIX}${blobKey}`);
      return;
    }

    const existing = await SecureStore.getItemAsync(key);

    if (existing?.startsWith(LARGE_VALUE_PREFIX)) {
      const blobKey = existing.slice(LARGE_VALUE_PREFIX.length);
      await AsyncStorage.removeItem(blobKey);
    }

    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    const existing = await SecureStore.getItemAsync(key);

    if (existing?.startsWith(LARGE_VALUE_PREFIX)) {
      const blobKey = existing.slice(LARGE_VALUE_PREFIX.length);
      await AsyncStorage.removeItem(blobKey);
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = env.hasSupabase
  ? createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
