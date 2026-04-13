import {
  createContext,
  PropsWithChildren,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { defaultAppState, loadStoredState, persistState } from "@/lib/storage";
import { createRepository } from "@/lib/repositories";
import {
  AppState,
  AthleteProfile,
  ReadinessInput,
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
  startLocalPreview: (email: string) => Promise<void>;
  completeOnboarding: (profile: AthleteProfile) => Promise<void>;
  logWorkout: (payload: CompleteWorkoutInput) => Promise<void>;
  resetAll: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const repository = createRepository();

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

  useEffect(() => {
    if (syncError) {
      console.error("Endura Lab sync error", syncError);
    }
  }, [syncError]);

  useEffect(() => {
    let active = true;

    (async () => {
      const storedState = await loadStoredState();
      const session = await repository.getSession();

      if (!active) {
        return;
      }

      const userChanged = session?.userId !== storedState.session?.userId;
      let nextState: AppState = userChanged
        ? {
            ...storedState,
            session,
            profile: null,
            workoutLogs: [],
            onboardingCompleted: false,
          }
        : {
            ...storedState,
            session,
          };

      if (session && repository.isConfigured) {
        setSyncStatus("syncing");

        try {
          const [remoteProfile, remoteWorkoutLogs] = await Promise.all([
            repository.loadProfile(session.userId),
            repository.loadWorkoutLogs(session.userId),
          ]);

          nextState = {
            ...nextState,
            profile: remoteProfile
              ? {
                  email: remoteProfile.email,
                  primarySport: remoteProfile.primarySport,
                  secondarySports: remoteProfile.secondarySports,
                  experienceLevel: remoteProfile.experienceLevel,
                  trainingDays: remoteProfile.trainingDays,
                  goalFocus: remoteProfile.goalFocus,
                  bodyweightKg: remoteProfile.bodyweightKg,
                  bjjWeightClass: remoteProfile.bjjWeightClass,
                  injuryNotes: remoteProfile.injuryNotes,
                }
              : defaultAppState.profile,
            onboardingCompleted: Boolean(remoteProfile),
            workoutLogs: remoteWorkoutLogs,
          };

          setSyncStatus("idle");
        } catch (error) {
          setSyncStatus("error");
          setSyncError(error instanceof Error ? error.message : "Failed to load remote data.");
        }
      }

      startTransition(() => {
        setState(nextState);
        setHydrated(true);
        setAuthReady(true);
      });
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistState(state);
  }, [hydrated, state]);

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
      async startLocalPreview(email) {
        const session = await repository.startLocalPreviewSession(email);

        setState((current) => ({
          ...current,
          session,
        }));
      },
      async completeOnboarding(profile) {
        let nextProfile = profile;

        if (state.session?.source === "supabase") {
          try {
            setSyncStatus("syncing");
            const remoteProfile = await repository.saveProfile(profile, state.session);
            nextProfile = {
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
            setSyncStatus("idle");
          } catch (error) {
            setSyncStatus("error");
            setSyncError(error instanceof Error ? error.message : "Profile sync failed.");
            throw error;
          }
        }

        setState((current) => ({
          ...current,
          profile: nextProfile,
          onboardingCompleted: true,
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
        setState((current) => ({
          ...current,
          workoutLogs: [entry, ...current.workoutLogs],
        }));

        if (state.session?.source === "supabase") {
          try {
            setSyncStatus("syncing");
            await repository.saveWorkoutLog(entry, state.session);
            setSyncStatus("idle");
          } catch (error) {
            setState((current) => ({
              ...current,
              workoutLogs: current.workoutLogs.filter((item) => item.id !== entry.id),
            }));
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
    [authReady, hydrated, state, syncError, syncStatus],
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
