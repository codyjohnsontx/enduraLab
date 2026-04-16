import { AthleteProfile, AuthSession, RemoteProfile, WorkoutLog } from "@/types/domain";
import { defaultAppState } from "@/lib/storage";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function createProfile(session: AuthSession): AthleteProfile {
  return {
    email: session.email,
    primarySport: "cycling",
    secondarySports: ["bjj"],
    experienceLevel: "foundation",
    trainingDays: 3,
    goalFocus: "strength_to_weight",
    bodyweightKg: 75,
  };
}

function toRemoteProfile(profile: AthleteProfile, session: AuthSession): RemoteProfile {
  return {
    ...profile,
    userId: session.userId,
    updatedAt: "2026-04-14T00:00:00.000Z",
  };
}

describe("AppProvider", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  async function renderProvider(options?: {
    session?: AuthSession | null;
    storedState?: typeof defaultAppState;
    remoteProfile?: RemoteProfile | null;
    remoteWorkoutLogs?: WorkoutLog[];
    saveProfileImpl?: (profile: AthleteProfile, session: AuthSession) => Promise<RemoteProfile>;
    saveWorkoutImpl?: (workoutLog: WorkoutLog, session: AuthSession) => Promise<WorkoutLog>;
  }) {
    const authListeners: Array<(session: AuthSession | null) => void> = [];
    const repository = {
      mode: options?.session?.source ?? "supabase",
      isConfigured: true,
      getSession: jest.fn(async () => options?.session ?? null),
      subscribeToAuthChanges: jest.fn((listener: (session: AuthSession | null) => void) => {
        authListeners.push(listener);
        return () => undefined;
      }),
      signInWithMagicLink: jest.fn(async () => ({ mode: "supabase" as const, sent: true })),
      signInWithPassword: jest.fn(async (email: string) => ({
        session: {
          userId: "password-user",
          email,
          source: "supabase" as const,
        },
      })),
      signUpWithPassword: jest.fn(async () => ({
        session: null,
        emailConfirmationRequired: true,
      })),
      updatePassword: jest.fn(async () => undefined),
      startLocalPreviewSession: jest.fn(async (email: string) => ({
        userId: `preview-${email}`,
        email,
        source: "local-preview" as const,
      })),
      signOut: jest.fn(async () => undefined),
      loadProfile: jest.fn(async () => options?.remoteProfile ?? null),
      saveProfile: jest.fn(
        options?.saveProfileImpl ??
          (async (profile: AthleteProfile, session: AuthSession) => toRemoteProfile(profile, session)),
      ),
      loadWorkoutLogs: jest.fn(async () => options?.remoteWorkoutLogs ?? []),
      saveWorkoutLog: jest.fn(
        options?.saveWorkoutImpl ??
          (async (workoutLog: WorkoutLog, session: AuthSession) => ({
            ...workoutLog,
            userId: session.userId,
            updatedAt: "2026-04-14T00:00:00.000Z",
          })),
      ),
    };

    const persistState = jest.fn(async () => undefined);

    jest.doMock("@/lib/repositories", () => ({
      createRepository: () => repository,
    }));
    jest.doMock("@/lib/storage", () => ({
      defaultAppState,
      loadStoredState: jest.fn(async () => options?.storedState ?? defaultAppState),
      persistState,
    }));
    jest.doMock("@/lib/supabase", () => ({
      createSessionFromUrl: jest.fn(async () => null),
      supabase: null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const renderer = require("react-test-renderer");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const providerModule = require("@/providers/app-provider");
    const { AppProvider, useAppState } = providerModule;

    let latestValue: ReturnType<typeof useAppState> | null = null;

    function Probe() {
      const value = useAppState();
      latestValue = value;

      return <Text>{value.repositoryMode}</Text>;
    }

    let tree: ReturnType<typeof renderer.create>;

    await renderer.act(async () => {
      tree = renderer.create(
        <AppProvider>
          <Probe />
        </AppProvider>,
      );
    });

    async function flush() {
      await renderer.act(async () => {
        await Promise.resolve();
      });
    }

    for (let i = 0; i < 5; i += 1) {
      await flush();
    }

    expect(latestValue?.authReady).toBe(true);
    expect(latestValue?.hydrated).toBe(true);

    return {
      repository,
      persistState,
      getValue: () => latestValue!,
      emitAuthChange: (session: AuthSession | null) => {
        authListeners.forEach((listener) => listener(session));
      },
      act: renderer.act,
      flush,
      unmount: async () => {
        await renderer.act(async () => {
          tree.unmount();
        });
      },
    };
  }

  it("bootstraps to an auth-ready signed-out state", async () => {
    const screen = await renderProvider({ session: null });

    expect(screen.getValue().session).toBeNull();
    expect(screen.getValue().onboardingCompleted).toBe(false);
    await screen.unmount();
  });

  it("signs in with password and restores remote profile state", async () => {
    const passwordSession: AuthSession = {
      userId: "password-user",
      email: "athlete@enduralab.app",
      source: "supabase",
    };
    const screen = await renderProvider({
      session: null,
      remoteProfile: toRemoteProfile(createProfile(passwordSession), passwordSession),
    });

    await screen.act(async () => {
      await screen.getValue().signInWithPassword("athlete@enduralab.app", "password123");
    });
    await screen.flush();

    expect(screen.repository.signInWithPassword).toHaveBeenCalledWith(
      "athlete@enduralab.app",
      "password123",
    );
    expect(screen.repository.getSession).toHaveBeenCalledTimes(2);
    expect(screen.getValue().session).toEqual({
      userId: "password-user",
      email: "athlete@enduralab.app",
      source: "supabase",
    });
    expect(screen.getValue().profile).toEqual(createProfile(passwordSession));
    expect(screen.getValue().onboardingCompleted).toBe(true);
    expect(screen.repository.loadProfile).toHaveBeenCalledWith("password-user");
    await screen.unmount();
  });

  it("does not expose signed-in auth changes until remote state is restored", async () => {
    const nextSession: AuthSession = {
      userId: "user-auth-change",
      email: "athlete@enduralab.app",
      source: "supabase",
    };
    const deferred = createDeferred<RemoteProfile | null>();
    const screen = await renderProvider({
      session: null,
      saveProfileImpl: undefined,
    });
    screen.repository.loadProfile.mockImplementationOnce(() => deferred.promise);

    await screen.act(async () => {
      screen.emitAuthChange(nextSession);
      await Promise.resolve();
    });

    expect(screen.getValue().session).toBeNull();
    expect(screen.getValue().onboardingCompleted).toBe(false);

    await screen.act(async () => {
      deferred.resolve(toRemoteProfile(createProfile(nextSession), nextSession));
      await Promise.resolve();
    });
    await screen.flush();

    expect(screen.getValue().session).toEqual(nextSession);
    expect(screen.getValue().profile).toEqual(createProfile(nextSession));
    expect(screen.getValue().onboardingCompleted).toBe(true);
    await screen.unmount();
  });

  it("surfaces password signup confirmation requirements", async () => {
    const screen = await renderProvider({ session: null });

    let result!: { emailConfirmationRequired: boolean };
    await screen.act(async () => {
      result = await screen.getValue().signUpWithPassword("athlete@enduralab.app", "password123");
    });
    await screen.flush();

    expect(screen.repository.signUpWithPassword).toHaveBeenCalledWith(
      "athlete@enduralab.app",
      "password123",
    );
    expect(result).toEqual({ emailConfirmationRequired: true });
    expect(screen.getValue().session).toBeNull();
    await screen.unmount();
  });

  it("updates password through the repository", async () => {
    const session: AuthSession = {
      userId: "user-password",
      email: "athlete@enduralab.app",
      source: "supabase",
    };
    const screen = await renderProvider({ session });

    await screen.act(async () => {
      await screen.getValue().updatePassword("password123");
    });
    await screen.flush();

    expect(screen.repository.updatePassword).toHaveBeenCalledWith("password123");
    await screen.unmount();
  });

  it("completes onboarding with remote profile sync", async () => {
    const session: AuthSession = {
      userId: "user-1",
      email: "athlete@enduralab.app",
      source: "supabase",
    };
    const screen = await renderProvider({ session });

    await screen.act(async () => {
      await screen.getValue().completeOnboarding(createProfile(session));
    });
    await screen.flush();

    expect(screen.getValue().profile).toEqual(createProfile(session));
    expect(screen.getValue().onboardingCompleted).toBe(true);
    expect(screen.repository.saveProfile).toHaveBeenCalledTimes(1);
    await screen.unmount();
  });

  it("preserves onboardingCompleted during profile updates", async () => {
    const session: AuthSession = {
      userId: "user-2",
      email: "athlete@enduralab.app",
      source: "supabase",
    };
    const profile = createProfile(session);
    const screen = await renderProvider({
      session,
      remoteProfile: toRemoteProfile(profile, session),
    });

    await screen.act(async () => {
      await screen.getValue().updateProfile({
        ...profile,
        bodyweightKg: 73,
      });
    });
    await screen.flush();

    expect(screen.getValue().onboardingCompleted).toBe(true);
    expect(screen.getValue().profile?.bodyweightKg).toBe(73);
    await screen.unmount();
  });

  it("rolls back optimistic workout logs on remote failure", async () => {
    const session: AuthSession = {
      userId: "user-3",
      email: "athlete@enduralab.app",
      source: "supabase",
    };
    const screen = await renderProvider({
      session,
      saveWorkoutImpl: async () => {
        throw new Error("Workout sync failed");
      },
    });

    let actionPromise!: Promise<unknown>;
    await screen.act(async () => {
      actionPromise = screen
        .getValue()
        .logWorkout({
          sessionId: "cycling-1",
          sport: "cycling",
          readiness: {
            sleepHours: 8,
            soreness: 1,
            energy: 4,
            stress: 1,
            pain: 0,
            level: "green",
          },
          metrics: { durationMinutes: 45 },
        })
        .catch((error: unknown) => error);
    });

    const actionError = await actionPromise;
    await screen.flush();

    expect(actionError).toBeInstanceOf(Error);
    expect((actionError as Error).message).toBe("Workout sync failed");
    expect(screen.getValue().workoutLogs).toEqual([]);
    expect(screen.getValue().syncStatus).toBe("error");
    await screen.unmount();
  });

  it("throws when the session changes during profile save", async () => {
    const session: AuthSession = {
      userId: "user-4",
      email: "athlete@enduralab.app",
      source: "supabase",
    };
    const nextSession: AuthSession = {
      userId: "user-5",
      email: "other@enduralab.app",
      source: "supabase",
    };
    const deferred = createDeferred<RemoteProfile>();
    const screen = await renderProvider({
      session,
      saveProfileImpl: () => deferred.promise,
    });

    let actionPromise!: Promise<unknown>;
    await screen.act(async () => {
      actionPromise = screen
        .getValue()
        .completeOnboarding(createProfile(session))
        .catch((error: unknown) => error);
      await Promise.resolve();
    });

    await screen.act(async () => {
      screen.emitAuthChange(nextSession);
      await Promise.resolve();
    });

    await screen.act(async () => {
      deferred.resolve(toRemoteProfile(createProfile(session), session));
      await Promise.resolve();
    });

    const actionError = await actionPromise;
    await screen.flush();

    expect(actionError).toBeInstanceOf(Error);
    expect((actionError as Error).message).toBe("Session changed during saveProfileWithSync.");
    expect(screen.getValue().session).toEqual(nextSession);
    await screen.unmount();
  });
});
