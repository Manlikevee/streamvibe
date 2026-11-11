import { colors, fonts } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
export function Section({ title, children, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { marginTop: 28, gap: 14 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
  action: { fontFamily: fonts.medium, fontSize: 13, color: colors.red },
});
