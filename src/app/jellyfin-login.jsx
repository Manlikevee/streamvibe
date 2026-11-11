import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, fonts } from '@/constants/theme';
import { authenticateJellyfin } from '@/services/jellyfin';
export default function JellyfinLogin() {
    const [username, setUsername] = useState('presh');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        setError(null);
        if (!username.trim() || !password)
            return setError('Enter your Jellyfin username and password.');
        setBusy(true);
        try {
            await authenticateJellyfin(username.trim(), password);
            router.replace('/(tabs)/home');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not connect to Jellyfin.');
        }
        finally {
            setBusy(false);
        }
    };
    return (<AuthLayout title="Connect your library" subtitle="Sign in to Jellyfin to browse and play your movies and shows.">
      <Input label="Username" autoCapitalize="none" value={username} onChangeText={setUsername}/>
      <Input label="Password" secureTextEntry value={password} onChangeText={setPassword}/>
      {error ? <Text style={{ color: colors.error, fontFamily: fonts.regular }}>{error}</Text> : null}
      <Button title="Connect to Jellyfin" icon="server-outline" onPress={submit} loading={busy} fullWidth/>
    </AuthLayout>);
}
