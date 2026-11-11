import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';
export function Header() {
    return (<View style={styles.wrap}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="play" size={12} color={colors.white}/>
        </View>
        <Text style={styles.brandText}>StreamVibe</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => router.push('/search')} style={styles.action} hitSlop={8} accessibilityLabel="Search movies and shows">
          <Ionicons name="search" size={21} color={colors.white}/>
        </Pressable>
        <Pressable onPress={() => router.navigate('/profile')} style={styles.action} hitSlop={8} accessibilityLabel="Open profile menu">
          <Ionicons name="menu" size={22} color={colors.white}/>
        </Pressable>
      </View>
    </View>);
}
const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logo: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.red,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 2,
    },
    brandText: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.white },
    actions: { flexDirection: 'row', gap: 8 },
    action: {
        width: 44,
        height: 44,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
