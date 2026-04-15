# Supabase setup

This repo now includes the app-side sync scaffold and the first SQL migration for Endura Lab.

## 1. Expected env vars

Copy `.env.example` to `.env.local` or your preferred Expo env file and fill in:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 2. Auth configuration

In the Supabase dashboard:

- enable Email auth
- add `enduralab://auth/callback` to the redirect URL allow list
- add your local web callback root if you plan to test in browser, for example `http://127.0.0.1:8082/`
- if magic-link emails still point to `localhost:3000`, check `Authentication -> Email Templates` and make sure the link uses the redirect target passed by the app rather than a hard-coded site URL; the template should not force a localhost site URL for mobile flows

The app now handles magic-link callbacks in-app and finalizes the session from the redirect URL.

## 3. Required tables

Apply the migration in `supabase/migrations/20260413030000_create_profiles_and_workout_logs.sql`.

It creates:

- `public.profiles`
- `public.workout_logs`
- RLS policies scoped to `auth.uid()`
- delete policies for user-owned rows
- `updated_at` trigger behavior
- JSON object constraints for `readiness` and `metrics`
- sport constraints for `primary_sport`, `secondary_sports`, and `workout_logs.sport`
- basic indexes for user lookups and log ordering

## 4. Android dev build setup

Use an EAS development build for Android. Expo Go is not enough for the custom scheme callback flow.

1. Log in to EAS if needed:

```bash
eas login
```

1. Build and install the Android development client:

```bash
eas build --profile development --platform android
```

1. Start Metro for the dev client:

```bash
npm run start:dev-client
```

1. Open the installed development build on the Android device and connect it to the running Metro server.

The Android application id for this repo is `com.enduralab.app`.

## 5. Android-first test flow

For device auth testing, use a development build or standalone build. A custom scheme callback like `enduralab://auth/callback` is not reliable in Expo Go.

Suggested smoke test:

1. Start the app with real env vars loaded.
2. Open the app on Android.
3. Request a magic link from the auth screen.
4. Open the email on the same device and follow the link back into the app.
5. Confirm the app lands in onboarding for a new user.
6. Complete onboarding and verify a `profiles` row is created.
7. Log a workout and verify a `workout_logs` row is created.
8. Fully restart the app and confirm profile and workout logs rehydrate from Supabase.
9. Sign out and confirm user-scoped state is cleared.

## 6. Notes

- Training plan content is still seeded in-app in this phase.
- Only user profile and workout logs are intended to sync remotely.
- Local preview mode remains available when env vars are absent.
- For local web testing, use a history-fallback server so auth callback returns resolve back into the app shell.
