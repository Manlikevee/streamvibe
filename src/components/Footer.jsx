import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
const COLUMNS = [
    { title: 'Home', links: ['Categories', 'Devices', 'Pricing', 'FAQ'] },
    { title: 'Movies', links: ['Genres', 'Trending', 'New Release', 'Popular'] },
    { title: 'Shows', links: ['Genres', 'Trending', 'New Release', 'Popular'] },
    { title: 'Support', links: ['Contact Us'] },
    { title: 'Subscription', links: ['Plans', 'Features'] },
];
const SOCIALS = ['logo-facebook', 'logo-twitter', 'logo-linkedin'];
export function Footer() {
    return (<View style={styles.wrap}>
      <View style={styles.grid}>
        {COLUMNS.map((col) => (<View key={col.title} style={styles.col}>
            <Text style={styles.colTitle}>{col.title}</Text>
            {col.links.map((l) => (<Pressable key={l} hitSlop={6}>
                <Text style={styles.link}>{l}</Text>
              </Pressable>))}
          </View>))}
        <View style={styles.col}>
          <Text style={styles.colTitle}>Connect With Us</Text>
          <View style={styles.socials}>
            {SOCIALS.map((s) => (<View key={s} style={styles.social}>
                <Ionicons name={s} size={18} color={colors.white}/>
              </View>))}
          </View>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.copy}>© 2023 streamvib, All Rights Reserved</Text>
        <View style={styles.legal}>
          <Text style={styles.link}>Terms of Use</Text>
          <Text style={styles.link}>Privacy Policy</Text>
          <Text style={styles.link}>Cookie Policy</Text>
        </View>
      </View>
    </View>);
}
const styles = StyleSheet.create({
    wrap: {
        marginTop: 48,
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 16,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    col: { width: '50%', gap: 10, marginBottom: 24 },
    colTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.white, marginBottom: 4 },
    link: { fontFamily: fonts.light, fontSize: 14, color: colors.muted, lineHeight: 22 },
    socials: { flexDirection: 'row', gap: 10 },
    social: {
        width: 44,
        height: 44,
        borderRadius: 6,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottom: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, gap: 12 },
    copy: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
    legal: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
});
