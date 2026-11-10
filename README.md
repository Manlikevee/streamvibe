# StreamVibe (Expo + React Native)

A streaming app UI built from the Veeshutter design reference, powered by TMDB.

## Setup

```bash
npm install
npx expo install @react-native-async-storage/async-storage @expo-google-fonts/manrope
cp .env.example .env         # then paste your TMDB key into .env
npx expo start -c
```

Get a TMDB key at https://www.themoviedb.org/settings/api. Either the v3 key or the v4 read-access token works.

## Screens

- Onboarding slider (3 slides, skip / next / get started)
- Login and Sign up (validated, local storage only)
- Home: Movies / Shows toggle, hero, Our Genres, Top 10 by genre, Trending, New Releases, Must-Watch, CTA, footer
- Movie detail and Show detail (with expandable seasons and episodes)
- Category list (tap any genre)
- Plans: monthly/yearly pricing, plan comparison table
- Profile with log out

## Notes

- Auth is local-only (AsyncStorage) so the flow works without a backend. Swap `src/context/AuthContext.tsx` for a real provider before release.
- Plan prices and comparison values live in `src/constants/plans.ts`.
- Colors and fonts live in `src/constants/theme.ts`.
- Play buttons are placeholders; no video source is wired up.
