import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { isEmail } from '@/utils/format';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (!isEmail(email)) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');
    setBusy(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue watching where you left off.">
      <Input label="Email" placeholder="you@example.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input label="Password" placeholder="Enter your password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Log In" onPress={submit} loading={busy} fullWidth />
      <View style={styles.row}>
        <Text style={styles.muted}>New to StreamVibe? </Text>
        <Pressable onPress={() => router.replace('/signup')}>
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.red },
});
