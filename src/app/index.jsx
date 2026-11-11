import { Redirect } from 'expo-router';
import React from 'react';
import { Loading } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
// Routing gate: onboarding -> login -> app.
export default function Index() {
    const { ready, onboarded, user } = useAuth();
    if (!ready)
        return <Loading />;
    if (!onboarded)
        return <Redirect href="/onboarding"/>;
    if (!user)
        return <Redirect href="/login"/>;
    return <Redirect href="/home"/>;
}
