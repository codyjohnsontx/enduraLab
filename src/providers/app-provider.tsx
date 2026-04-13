import {
  createContext,
  PropsWithChildren,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { loadStoredState, persistState } from "@/lib/storage";
import {
  AppState,
  AthleteProfile,
  ReadinessInput,
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
  completeOnboarding: (profile: AthleteProfile) => void;
  logWorkout: (payload: CompleteWorkoutInput) => void;
  resetAll: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>({
    profile: null,
    workoutLogs: [],
    onboardingCompleted: false,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    loadStoredState().then((storedState) => {
      if (!active) {
        return;
      }

      startTransition(() => {
        setState(storedState);
        setHydrated(true);
      });
    });

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
      completeOnboarding(profile) {
        setState((current) => ({
          profile,
          onboardingCompleted: true,
          workoutLogs: current.workoutLogs,
        }));
      },
      logWorkout(payload) {
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
      },
      resetAll() {
        setState({
          profile: null,
          workoutLogs: [],
          onboardingCompleted: false,
        });
      },
    }),
    [hydrated, state],
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
