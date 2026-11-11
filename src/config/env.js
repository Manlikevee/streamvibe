// Expo inlines EXPO_PUBLIC_* variables at build time.
// Restart `npx expo start -c` after editing .env.
export const env = {
    tmdbApiKey: process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '',
};
