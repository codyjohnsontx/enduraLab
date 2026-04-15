# Endura Lab

## UI stack

This app now uses a NativeWind-based component foundation to support a `react-native-reusables`-style migration path without rewriting the whole app at once.

- Tailwind config lives in `tailwind.config.js`
- global styles live in `global.css`
- the bridged component layer stays in `src/components/ui.tsx`
- the first migrated proof point is `app/auth.tsx`

## Frontend workflow

```bash
npm test
npx tsc --noEmit
npx expo export --platform web --clear
```

Use `src/components/ui.tsx` as the import surface for future screen migrations so the app can move incrementally instead of swapping every screen at once.
