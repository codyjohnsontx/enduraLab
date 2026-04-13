import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppState } from "@/types/domain";

const STORAGE_KEY = "endura-lab-state";

export const defaultAppState: AppState = {
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
