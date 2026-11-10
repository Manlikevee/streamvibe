import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const MENU: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; to?: string }[] = [
  { icon: 'card-outline', label: 'Manage subscription', to: '/plans' },
  { icon: 'help-circle-outline', label: 'Help center' },
  { icon: 'document-text-outline', label: 'Terms of Use' },
  { icon: 'shield-checkmark-outline', label: 'Privacy Policy' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {MENU.map((m) => (
            <Pressable
              key={m.label}
              onPress={() => m.to && router.navigate(m.to)}
              style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={m.icon} size={20} color={colors.mutedLight} />
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <Button title="Log Out" variant="secondary" icon="log-out-outline" onPress={onLogout} fullWidth style={{ marginTop: 20 }} />
        <Footer />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 22, color: colors.white },
  name: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
  email: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  menu: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.white },
});
