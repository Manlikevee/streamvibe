import { Manrope_300Light, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold, useFonts, } from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
SplashScreen.preventAutoHideAsync().catch(() => { });
export default function RootLayout() {
    const [loaded] = useFonts({
        Manrope_300Light,
        Manrope_400Regular,
        Manrope_500Medium,
        Manrope_600SemiBold,
        Manrope_700Bold,
        Manrope_800ExtraBold,
    });
    useEffect(() => {
        if (loaded)
            SplashScreen.hideAsync().catch(() => { });
    }, [loaded]);
    if (!loaded)
        return null;
    return (<AuthProvider>
      <StatusBar style="light"/>
      <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
        }}/>
    </AuthProvider>);
}
export function ErrorBoundary({ error, retry }) {
    return (<View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
      <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>Something went wrong</Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>{error?.message}</Text>
      <Pressable onPress={retry} style={{ backgroundColor: colors.red, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 5 }}>
        <Text style={{ color: colors.white, fontWeight: '600' }}>Try again</Text>
      </Pressable>
    </View>);
}
