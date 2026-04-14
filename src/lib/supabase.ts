import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

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

const webStorage = {
  async getItem(key: string) {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

const authStorage = Platform.OS === "web" ? webStorage : secureStorage;

export const supabase = env.hasSupabase
  ? createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function getMagicLinkRedirectUrl() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/`;
    }

    return "/";
  }

  return Linking.createURL("/auth/callback", { scheme: "enduralab" });
}

function getAuthParamsFromUrl(url: string) {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const serializedParams =
    hashIndex >= 0
      ? url.slice(hashIndex + 1)
      : queryIndex >= 0
        ? url.slice(queryIndex + 1)
        : "";

  return new URLSearchParams(serializedParams);
}

function stripAuthParamsFromCurrentUrl() {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return;
  }

  const currentUrl = new URL(window.location.href);
  const hashParams = new URLSearchParams(currentUrl.hash.startsWith("#") ? currentUrl.hash.slice(1) : "");
  const queryParams = currentUrl.searchParams;
  const authKeys = [
    "access_token",
    "refresh_token",
    "expires_at",
    "expires_in",
    "token_type",
    "type",
    "provider_token",
    "provider_refresh_token",
    "error",
    "error_code",
    "error_description",
  ];

  let changed = false;

  authKeys.forEach((key) => {
    if (hashParams.has(key)) {
      hashParams.delete(key);
      changed = true;
    }

    if (queryParams.has(key)) {
      queryParams.delete(key);
      changed = true;
    }
  });

  if (!changed) {
    return;
  }

  const nextHash = hashParams.toString();
  const nextUrl = `${currentUrl.pathname}${queryParams.toString() ? `?${queryParams.toString()}` : ""}${
    nextHash ? `#${nextHash}` : ""
  }`;

  window.history.replaceState(window.history.state, "", nextUrl);
}

export async function createSessionFromUrl(url: string) {
  if (!supabase) {
    return null;
  }

  try {
    const params = getAuthParamsFromUrl(url);
    const authError = params.get("error");
    const authErrorDescription = params.get("error_description");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (authError || authErrorDescription) {
      throw new Error(
        `Supabase auth callback failed: ${authError ?? "unknown_error"}${
          authErrorDescription ? ` - ${authErrorDescription}` : ""
        }`,
      );
    }

    if (!accessToken || !refreshToken) {
      return null;
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return data.session;
  } finally {
    stripAuthParamsFromCurrentUrl();
  }
}
