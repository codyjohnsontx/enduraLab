describe("supabase helpers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SUPABASE_URL: "https://endura-lab.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses the web origin for magic link redirects", async () => {
    const replaceState = jest.fn();
    const createClient = jest.fn(() => ({
      auth: { setSession: jest.fn(), getSession: jest.fn() },
    }));

    jest.doMock("@supabase/supabase-js", () => ({ createClient }));
    jest.doMock("react-native", () => ({
      Platform: { OS: "web" },
    }));

    Object.defineProperty(window, "location", {
      value: {
        origin: "http://127.0.0.1:8082",
        href: "http://127.0.0.1:8082/",
      },
      configurable: true,
    });
    Object.defineProperty(window, "history", {
      value: { replaceState, state: { key: "router-state" } },
      configurable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getMagicLinkRedirectUrl } = require("@/lib/supabase");

    expect(getMagicLinkRedirectUrl()).toBe("http://127.0.0.1:8082/");
  });

  it("throws on callback error params and still strips auth params from the URL", async () => {
    const setSession = jest.fn();
    const replaceState = jest.fn();

    jest.doMock("@supabase/supabase-js", () => ({
      createClient: jest.fn(() => ({
        auth: { setSession, getSession: jest.fn() },
      })),
    }));
    jest.doMock("react-native", () => ({
      Platform: { OS: "web" },
    }));

    Object.defineProperty(window, "location", {
      value: {
        origin: "http://127.0.0.1:8082",
        href: "http://127.0.0.1:8082/?error=access_denied&error_description=link+expired",
      },
      configurable: true,
    });
    Object.defineProperty(window, "history", {
      value: { replaceState, state: { key: "router-state" } },
      configurable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createSessionFromUrl } = require("@/lib/supabase");

    await expect(
      createSessionFromUrl("http://127.0.0.1:8082/?error=access_denied&error_description=link+expired"),
    ).rejects.toThrow("Supabase auth callback failed: access_denied - link expired");

    expect(setSession).not.toHaveBeenCalled();
    expect(replaceState).toHaveBeenCalledWith(
      { key: "router-state" },
      "",
      "/",
    );
  });

  it("restores a session and strips callback tokens from the browser URL", async () => {
    const setSession = jest.fn(async () => ({
      data: { session: { access_token: "token" } },
      error: null,
    }));
    const replaceState = jest.fn();

    jest.doMock("@supabase/supabase-js", () => ({
      createClient: jest.fn(() => ({
        auth: { setSession, getSession: jest.fn() },
      })),
    }));
    jest.doMock("react-native", () => ({
      Platform: { OS: "web" },
    }));

    Object.defineProperty(window, "location", {
      value: {
        origin: "http://127.0.0.1:8082",
        href:
          "http://127.0.0.1:8082/?access_token=access&refresh_token=refresh&type=magiclink",
      },
      configurable: true,
    });
    Object.defineProperty(window, "history", {
      value: { replaceState, state: { key: "router-state" } },
      configurable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createSessionFromUrl } = require("@/lib/supabase");

    await expect(
      createSessionFromUrl(
        "http://127.0.0.1:8082/?access_token=access&refresh_token=refresh&type=magiclink",
      ),
    ).resolves.toEqual({ access_token: "token" });

    expect(setSession).toHaveBeenCalledWith({
      access_token: "access",
      refresh_token: "refresh",
    });
    expect(replaceState).toHaveBeenCalledWith(
      { key: "router-state" },
      "",
      "/",
    );
  });
});
