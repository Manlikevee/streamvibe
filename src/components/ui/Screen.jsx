import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/theme';
import { Button } from './Button';
export function Screen({ children, edges = ['top', 'bottom'] }) {
    return (<SafeAreaView style={styles.safe} edges={edges}>
      {children}
    </SafeAreaView>);
}
export function Loading() {
    return (<Screen>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.red}/>
      </View>
    </Screen>);
}
export function ErrorState({ message, onRetry }) {
    return (<Screen>
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
        <Ionicons name="chevron-back" size={22} color={colors.white}/>
      </Pressable>
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.red}/>
        <Text style={styles.errTitle}>Something went wrong</Text>
        <Text style={styles.errMsg}>{message}</Text>
        {onRetry ? <Button title="Try again" onPress={onRetry}/> : null}
      </View>
    </Screen>);
}
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    backBtn: {
        margin: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.white },
    errMsg: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },
});
