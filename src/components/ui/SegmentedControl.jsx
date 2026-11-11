import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';
export function SegmentedControl({ options, value, onChange, style }) {
    return (<View style={[styles.wrap, style]}>
      {options.map((o) => {
            const active = o.value === value;
            return (<Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.item, active && styles.active]}>
            <Text style={[styles.text, active && styles.textActive]}>{o.label}</Text>
          </Pressable>);
        })}
    </View>);
}
const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: 4,
    },
    item: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
    active: { backgroundColor: colors.card },
    text: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
    textActive: { color: colors.white, fontFamily: fonts.medium },
});
