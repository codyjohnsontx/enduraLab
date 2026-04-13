# Supabase setup

This repo now includes the app-side sync scaffold and the first SQL migration for Endura Lab.

## Expected env vars

Copy `.env.example` to `.env.local` or your preferred Expo env file and fill in:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Required tables

Apply the migration in `supabase/migrations/20260413030000_create_profiles_and_workout_logs.sql`.

It creates:

- `public.profiles`
- `public.workout_logs`
- RLS policies scoped to `auth.uid()`
- `updated_at` trigger behavior
- basic indexes for user lookups and log ordering

## Notes

- Training plan content is still seeded in-app in this phase.
- Only user profile and workout logs are intended to sync remotely.
- Local preview mode remains available when env vars are absent.
