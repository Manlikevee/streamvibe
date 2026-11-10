import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';

export function RatingStars({ value, size = 14, showValue = true }: { value: number; size?: number; showValue?: boolean }) {
  return (
    <View style={styles.row}>
      {[0, 1, 2, 3, 4].map((i) => {
        const left = value - i;
        const name = left >= 1 ? 'star' : left >= 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={i} name={name} size={size} color={left >= 0.5 ? colors.red : colors.starEmpty} />;
      })}
      {showValue ? <Text style={styles.value}>{value.toFixed(1)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  value: { fontFamily: fonts.medium, fontSize: 13, color: colors.mutedLight, marginLeft: 6 },
});
