import {
  createContext,
  PropsWithChildren,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState as NativeAppState, Linking, Platform } from "react-native";

import { defaultAppState, loadStoredState, persistState } from "@/lib/storage";
import { createRepository } from "@/lib/repositories";
import { createSessionFromUrl, supabase } from "@/lib/supabase";
import {
  AppState,
  AthleteProfile,
  AuthSession,
  ReadinessInput,
  RemoteProfile,
  RepositoryMode,
  SyncStatus,
  WorkoutLog,
  WorkoutMetrics,
} from "@/types/domain";

type CompleteWorkoutInput = {
  sessionId: string;
  sport: WorkoutLog["sport"];
  readiness: ReadinessInput & { level: WorkoutLog["readiness"]["level"] };
  metrics: WorkoutMetrics;
  notes?: string;
};

type AppContextValue = AppState & {
  hydrated: boolean;
  authReady: boolean;
  repositoryMode: RepositoryMode;
  syncStatus: SyncStatus;
  syncError: string | null;
  requestMagicLink: (email: string) => Promise<{ sent: boolean; mode: RepositoryMode }>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ emailConfirmationRequired: boolean }>;
  updatePassword: (password: string) => Promise<void>;
  startLocalPreview: (email: string) => Promise<void>;
  completeOnboarding: (profile: AthleteProfile) => Promise<void>;
  updateProfile: (profile: AthleteProfile) => Promise<void>;
  logWorkout: (payload: CompleteWorkoutInput) => Promise<void>;
  resetAll: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const repository = createRepository();
const BOOTSTRAP_TIMEOUT_MS = 5000;

type SyncRemoteStateOptions = {
  session: AuthSession | null;
  storedState: AppState;
  repository: typeof repository;
  isCurrentSync: (token: number) => boolean;
  nextToken: () => number;
  setSyncStatus: (status: SyncStatus) => void;
  setSyncError: (error: string | null) => void;
};

async function withTimeout<T>(promise: Promise<T>, fallback: T, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Endura Lab ${label} timed out after ${BOOTSTRAP_TIMEOUT_MS}ms`);
      resolve(fallback);
    }, BOOTSTRAP_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function mapRemoteProfileToAthleteProfile(remoteProfile: RemoteProfile): AthleteProfile {
  return {
    email: remoteProfile.email,
    primarySport: remoteProfile.primarySport,
    secondarySports: remoteProfile.secondarySports,
    experienceLevel: remoteProfile.experienceLevel,
    trainingDays: remoteProfile.trainingDays,
    goalFocus: remoteProfile.goalFocus,
    bodyweightKg: remoteProfile.bodyweightKg,
    bjjWeightClass: remoteProfile.bjjWeightClass,
    injuryNotes: remoteProfile.injuryNotes,
  };
}

async function syncRemoteState({
  session,
  storedState,
  repository,
  isCurrentSync,
  nextToken,
  setSyncStatus,
  setSyncError,
}: SyncRemoteStateOptions) {
  const token = nextToken();

  if (!repository.isConfigured) {
    return {
      ...storedState,
      session,
    };
  }

  if (!session) {
    return {
      ...defaultAppState,
      session: null,
    };
  }

  if (isCurrentSync(token)) {
    setSyncStatus("syncing");
    setSyncError(null);
  }

  const baseState: AppState = {
    ...defaultAppState,
    session,
  };

  try {
    const [remoteProfile, remoteWorkoutLogs] = await withTimeout(
      Promise.all([repository.loadProfile(session.userId), repository.loadWorkoutLogs(session.userId)]),
      [null, []],
      "remote sync",
    );

    if (!isCurrentSync(token)) {
      return null;
    }

    setSyncStatus("idle");

    return {
      ...baseState,
      profile: remoteProfile ? mapRemoteProfileToAthleteProfile(remoteProfile) : null,
      onboardingCompleted: Boolean(remoteProfile),
      workoutLogs: remoteWorkoutLogs,
    };
  } catch (error) {
    if (!isCurrentSync(token)) {
      return null;
    }

    setSyncStatus("error");
    setSyncError(error instanceof Error ? error.message : "Failed to load remote data.");

    return baseState;
  }
}

function getSessionKey(session: AuthSession | null) {
  if (!session) {
    return null;
  }

  return `${session.source}:${session.userId}`;
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>({
    session: null,
    profile: null,
    workoutLogs: [],
    onboardingCompleted: false,
  });
  const [hydrated, setHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const stateRef = useRef(state);
  const syncCounterRef = useRef(0);
  const processedAuthUrlRef = useRef<string | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (syncError) {
      console.error("Endura Lab sync error", syncError);
    }
  }, [syncError]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    const syncSessionFromUrl = async (url: string) => {
      if (!active || processedAuthUrlRef.current === url) {
        return;
      }

      processedAuthUrlRef.current = url;

      try {
        await createSessionFromUrl(url);
      } catch (error) {
        console.error("Endura Lab auth callback failed", error);
        setSyncError("Sign-in could not be completed. Please try again.");
      }
    };

    let subscription: ReturnType<typeof Linking.addEventListener> | null = null;

    void (async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl) {
        await syncSessionFromUrl(initialUrl);
      }

      if (!active) {
        return;
      }

      subscription = Linking.addEventListener("url", ({ url }) => {
        void syncSessionFromUrl(url);
      });
    })();

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!supabase || Platform.OS === "web") {
      return;
    }

    const supabaseClient = supabase;

    supabaseClient.auth.startAutoRefresh();

    const subscription = NativeAppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        supabaseClient.auth.startAutoRefresh();
        return;
      }

      supabaseClient.auth.stopAutoRefresh();
    });

    return () => {
      subscription.remove();
      supabaseClient.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const isCurrentSync = (token: number) => active && syncCounterRef.current === token;
    const nextToken = () => ++syncCounterRef.current;
    const runSyncRemoteState = (session: AuthSession | null, storedState: AppState) =>
      syncRemoteState({
        session,
        storedState,
        repository,
        isCurrentSync,
        nextToken,
        setSyncStatus,
        setSyncError,
      });

    (async () => {
      const storedState = await withTimeout(loadStoredState(), defaultAppState, "state restore");
      const session = await withTimeout(repository.getSession(), null, "session restore");

      if (!active) {
        return;
      }

      const nextState = await runSyncRemoteState(session, storedState);

      if (!active || !nextState) {
        return;
      }

      startTransition(() => {
        setState(nextState);
        setHydrated(true);
        setAuthReady(true);
      });
    })();

    const unsubscribe = repository.subscribeToAuthChanges((session) => {
      if (!active) {
        return;
      }

      setState(() => ({
        ...defaultAppState,
        session,
      }));

      if (!session) {
        return;
      }

      void (async () => {
        const syncedState = await runSyncRemoteState(session, {
          ...stateRef.current,
          session,
        });

        if (!active || !syncedState) {
          return;
        }

        setState(syncedState);
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistState(state);
  }, [hydrated, state]);

  const saveProfileWithSync = async (profile: AthleteProfile, errorMessage: string) => {
    const initiatingSession = stateRef.current.session;
    const initiatingSessionKey = getSessionKey(initiatingSession);

    if (initiatingSession?.source !== "supabase") {
      return {
        nextProfile: profile,
      };
    }

    try {
      setSyncStatus("syncing");
      const remoteProfile = await repository.saveProfile(profile, initiatingSession);

      if (getSessionKey(stateRef.current.session) !== initiatingSessionKey) {
        throw new Error("Session changed during saveProfileWithSync.");
      }

      setSyncStatus("idle");

      return {
        nextProfile: mapRemoteProfileToAthleteProfile(remoteProfile),
      };
    } catch (error) {
      if (getSessionKey(stateRef.current.session) !== initiatingSessionKey) {
        throw new Error("Session changed during saveProfileWithSync.");
      }

      setSyncStatus("error");
      setSyncError(error instanceof Error ? error.message : errorMessage);
      throw error;
    }
  };

  const restoreSessionState = async (session: AuthSession) => {
    const token = ++syncCounterRef.current;
    const syncedState = await syncRemoteState({
      session,
      storedState: {
        ...stateRef.current,
        session,
      },
      repository,
      isCurrentSync: (syncToken) => syncCounterRef.current === syncToken,
      nextToken: () => token,
      setSyncStatus,
      setSyncError,
    });

    if (syncedState) {
      setState(syncedState);
    }
  };

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      authReady,
      repositoryMode: repository.mode,
      syncStatus,
      syncError,
      async requestMagicLink(email) {
        setSyncError(null);
        return repository.signInWithMagicLink(email);
      },
      async signInWithPassword(email, password) {
        setSyncError(null);
        const result = await repository.signInWithPassword(email, password);

        if (result.session) {
          await restoreSessionState(result.session);
        }
      },
      async signUpWithPassword(email, password) {
        setSyncError(null);
        const result = await repository.signUpWithPassword(email, password);

        if (result.session) {
          await restoreSessionState(result.session);
        }

        return { emailConfirmationRequired: Boolean(result.emailConfirmationRequired) };
      },
      async updatePassword(password) {
        setSyncError(null);
        await repository.updatePassword(password);
      },
      async startLocalPreview(email) {
        const session = await repository.startLocalPreviewSession(email);

        setState((current) => ({
          ...current,
          session,
        }));
      },
      async completeOnboarding(profile) {
        const { nextProfile } = await saveProfileWithSync(profile, "Profile sync failed.");

        setState((current) => ({
          ...current,
          profile: nextProfile,
          onboardingCompleted: true,
        }));
      },
      async updateProfile(profile) {
        const { nextProfile } = await saveProfileWithSync(profile, "Profile update failed.");

        setState((current) => ({
          ...current,
          profile: nextProfile,
        }));
      },
      async logWorkout(payload) {
        const entry: WorkoutLog = {
          id: `${payload.sessionId}-${Date.now()}`,
          sessionId: payload.sessionId,
          sport: payload.sport,
          completedAt: new Date().toISOString(),
          readiness: payload.readiness,
          metrics: payload.metrics,
          notes: payload.notes,
        };
        const initiatingSession = stateRef.current.session;

        setState((current) => ({
          ...current,
          workoutLogs: [entry, ...current.workoutLogs],
        }));

        if (initiatingSession?.source === "supabase") {
          try {
            setSyncStatus("syncing");
            await repository.saveWorkoutLog(entry, initiatingSession);

            if (stateRef.current.session !== initiatingSession) {
              return;
            }

            setSyncStatus("idle");
          } catch (error) {
            setState((current) => ({
              ...current,
              workoutLogs: current.workoutLogs.filter((item) => item.id !== entry.id),
            }));

            if (stateRef.current.session !== initiatingSession) {
              return;
            }

            setSyncStatus("error");
            setSyncError(error instanceof Error ? error.message : "Workout sync failed.");
            throw error;
          }
        }
      },
      async resetAll() {
        setState({
          session: state.session,
          profile: null,
          workoutLogs: [],
          onboardingCompleted: false,
        });
      },
      async signOut() {
        await repository.signOut();
        setState({
          session: null,
          profile: null,
          workoutLogs: [],
          onboardingCompleted: false,
        });
      },
    }),
    [authReady, hydrated, saveProfileWithSync, state, syncError, syncStatus],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}
