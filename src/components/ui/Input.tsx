import React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        style={[styles.input, !!error && styles.inputError]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.mutedLight },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  inputError: { borderColor: colors.red },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.error },
});
