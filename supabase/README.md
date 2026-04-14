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
- add your local web callback if you plan to test in browser, for example `http://localhost:8081/auth/callback`

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

## 4. Android-first test flow

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

## 5. Notes

- Training plan content is still seeded in-app in this phase.
- Only user profile and workout logs are intended to sync remotely.
- Local preview mode remains available when env vars are absent.
