import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';
export function Chip({ label }) {
    return (<View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>);
}
const styles = StyleSheet.create({
    chip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    text: { fontFamily: fonts.regular, fontSize: 13, color: colors.mutedLight },
});
