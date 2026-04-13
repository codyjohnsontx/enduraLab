import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppState, AuthSession } from "@/types/domain";

const STORAGE_KEY = "endura-lab-state";
const LOCAL_PREVIEW_SESSION_KEY = "endura-lab-local-preview-session";

export const defaultAppState: AppState = {
  session: null,
  profile: null,
  workoutLogs: [],
  onboardingCompleted: false,
};

export async function loadStoredState(): Promise<AppState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultAppState;
  }

  try {
    return { ...defaultAppState, ...JSON.parse(raw) };
  } catch {
    return defaultAppState;
  }
}

export async function persistState(state: AppState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function loadLocalPreviewSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(LOCAL_PREVIEW_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function persistLocalPreviewSession(session: AuthSession | null) {
  if (!session) {
    await AsyncStorage.removeItem(LOCAL_PREVIEW_SESSION_KEY);
    return;
  }

  await AsyncStorage.setItem(LOCAL_PREVIEW_SESSION_KEY, JSON.stringify(session));
}
