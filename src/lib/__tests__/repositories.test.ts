describe("repositories", () => {
  const originalEnv = process.env;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SUPABASE_URL: "https://endura-lab.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function mockSupabaseAuth(overrides?: Record<string, jest.Mock>) {
    const user = {
      id: "user-1",
      email: "athlete@enduralab.app",
    };
    const session = {
      user,
      access_token: "access-token",
      refresh_token: "refresh-token",
      token_type: "bearer",
      expires_in: 3600,
    };
    const auth = {
      getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOtp: jest.fn(),
      signInWithPassword: jest.fn(async () => ({ data: { session, user }, error: null })),
      signUp: jest.fn(async () => ({ data: { session, user }, error: null })),
      updateUser: jest.fn(async () => ({ data: { user }, error: null })),
      signOut: jest.fn(async () => ({ error: null })),
      ...overrides,
    };

    jest.doMock("@/lib/supabase", () => ({
      getMagicLinkRedirectUrl: jest.fn(() => "enduralab://auth/callback"),
      supabase: {
        auth,
        from: jest.fn(),
      },
    }));

    return { auth, session };
  }

  it("signs in with password through Supabase", async () => {
    const { auth } = mockSupabaseAuth();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRepository } = require("@/lib/repositories");
    const repository = createRepository();

    await expect(
      repository.signInWithPassword("athlete@enduralab.app", "password123"),
    ).resolves.toEqual({
      session: {
        userId: "user-1",
        email: "athlete@enduralab.app",
        source: "supabase",
      },
    });
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "athlete@enduralab.app",
      password: "password123",
    });
  });

  it("returns email confirmation state for password signup without a session", async () => {
    const { auth } = mockSupabaseAuth({
      signUp: jest.fn(async () => ({
        data: {
          session: null,
          user: {
            id: "user-1",
            email: "athlete@enduralab.app",
          },
        },
        error: null,
      })),
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRepository } = require("@/lib/repositories");
    const repository = createRepository();

    await expect(
      repository.signUpWithPassword("athlete@enduralab.app", "password123"),
    ).resolves.toEqual({
      session: null,
      emailConfirmationRequired: true,
    });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "athlete@enduralab.app",
      password: "password123",
    });
  });

  it("updates password through Supabase", async () => {
    const { auth } = mockSupabaseAuth();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRepository } = require("@/lib/repositories");
    const repository = createRepository();

    await expect(repository.updatePassword("password123")).resolves.toBeUndefined();
    expect(auth.updateUser).toHaveBeenCalledWith({
      password: "password123",
    });
  });

  it("surfaces password auth failures", async () => {
    mockSupabaseAuth({
      signInWithPassword: jest.fn(async () => ({
        data: { session: null, user: null },
        error: new Error("Invalid login credentials"),
      })),
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRepository } = require("@/lib/repositories");
    const repository = createRepository();

    await expect(
      repository.signInWithPassword("athlete@enduralab.app", "wrong-password"),
    ).rejects.toThrow("Invalid login credentials");
  });
});
