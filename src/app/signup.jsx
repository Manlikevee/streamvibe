import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { isEmail } from '@/utils/format';
export default function Signup() {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        setError(null);
        if (name.trim().length < 2)
            return setError('Enter your full name.');
        if (!isEmail(email))
            return setError('Enter a valid email address.');
        if (password.length < 6)
            return setError('Password must be at least 6 characters.');
        if (password !== confirm)
            return setError('Passwords do not match.');
        setBusy(true);
        try {
            await signup(name, email, password);
            router.replace('/home');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Sign up failed. Try again.');
        }
        finally {
            setBusy(false);
        }
    };
    return (<AuthLayout title="Create your account" subtitle="Join StreamVibe and get your free trial today.">
      <Input label="Full name" placeholder="Jane Doe" autoCapitalize="words" value={name} onChangeText={setName}/>
      <Input label="Email" placeholder="you@example.com" keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <Input label="Password" placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword}/>
      <Input label="Confirm password" placeholder="Re-enter password" secureTextEntry value={confirm} onChangeText={setConfirm}/>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Sign Up" onPress={submit} loading={busy} fullWidth/>
      <View style={styles.row}>
        <Text style={styles.muted}>Already have an account? </Text>
        <Pressable onPress={() => router.replace('/login')}>
          <Text style={styles.link}>Log in</Text>
        </Pressable>
      </View>
    </AuthLayout>);
}
const styles = StyleSheet.create({
    error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error },
    row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 },
    muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
    link: { fontFamily: fonts.medium, fontSize: 14, color: colors.red },
});
