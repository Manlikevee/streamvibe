import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CtaBanner } from '@/components/CtaBanner';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { colors, fonts, radius } from '@/constants/theme';
import { COMPARE, PLANS, type PlanId } from '@/constants/plans';

type Billing = 'monthly' | 'yearly';

export default function Plans() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const [compare, setCompare] = useState<PlanId>('standard');

  const priceLabel = (monthly: number) =>
    billing === 'monthly' ? { amount: `$${monthly.toFixed(2)}`, unit: '/month' } : { amount: `$${(monthly * 10).toFixed(2)}`, unit: '/year' };

  const notImplemented = () => Alert.alert('Coming soon', 'Payments are not connected in this demo.');

  return (
    <Screen edges={['top']}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose the plan that&apos;s right for you</Text>
        <Text style={styles.subtitle}>
          Join StreamVibe and select from our flexible subscription options tailored to suit your viewing preferences. Get ready for non-stop entertainment!
        </Text>

        <SegmentedControl
          options={[
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
          ]}
          value={billing}
          onChange={setBilling}
          style={styles.billing}
        />

        <View style={styles.plans}>
          {PLANS.map((p) => {
            const price = priceLabel(p.monthly);
            return (
              <View key={p.id} style={styles.planCard}>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planDesc}>{p.description}</Text>
                <Text style={styles.price}>
                  {price.amount} <Text style={styles.unit}>{price.unit}</Text>
                </Text>
                <View style={styles.planButtons}>
                  <Button title="Start Free Trial" variant="secondary" style={{ flex: 1 }} onPress={notImplemented} />
                  <Button title="Choose Plan" style={{ flex: 1 }} onPress={notImplemented} />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={[styles.title, { marginTop: 48 }]}>Compare our plans and find the right one for you</Text>
        <Text style={styles.subtitle}>
          StreamVibe offers three different plans to fit your needs: Basic, Standard, and Premium. Compare the features of each plan and choose the one that&apos;s right for you.
        </Text>

        <SegmentedControl
          options={PLANS.map((p) => ({ label: p.id.charAt(0).toUpperCase() + p.id.slice(1), value: p.id }))}
          value={compare}
          onChange={setCompare}
          style={styles.billing}
        />

        <View style={styles.table}>
          {COMPARE[compare].map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <CtaBanner />
        <Footer />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 24 },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, color: colors.white, marginTop: 8 },
  subtitle: { fontFamily: fonts.light, fontSize: 14, lineHeight: 22, color: colors.muted, marginTop: 10, marginBottom: 18 },
  billing: { alignSelf: 'flex-start', minWidth: 240, marginBottom: 18 },
  plans: { gap: 14 },
  planCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    gap: 10,
  },
  planName: { fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  planDesc: { fontFamily: fonts.light, fontSize: 13, lineHeight: 21, color: colors.muted },
  price: { fontFamily: fonts.bold, fontSize: 26, color: colors.white, marginTop: 6 },
  unit: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  planButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  table: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 16,
  },
  row: { gap: 4 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  rowValue: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.white },
});
