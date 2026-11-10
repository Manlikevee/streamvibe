import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { Header } from './ui/Header';
import { Screen } from './ui/Screen';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.form}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 24, gap: 10, flexGrow: 1 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, color: colors.white },
  subtitle: { fontFamily: fonts.light, fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 16 },
  form: { gap: 16 },
});
