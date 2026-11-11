import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
const KEYS = { onboarded: 'sv:onboarded', users: 'sv:users', session: 'sv:session' };
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [ready, setReady] = useState(false);
    const [onboarded, setOnboarded] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        (async () => {
            const [o, s] = await Promise.all([AsyncStorage.getItem(KEYS.onboarded), AsyncStorage.getItem(KEYS.session)]);
            setOnboarded(o === 'true');
            setUser(s ? JSON.parse(s) : null);
            setReady(true);
        })();
    }, []);
    const readUsers = async () => JSON.parse((await AsyncStorage.getItem(KEYS.users)) ?? '[]');
    const completeOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(KEYS.onboarded, 'true');
        setOnboarded(true);
    }, []);
    const login = useCallback(async (email, password) => {
        const users = await readUsers();
        const found = users.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
        if (!found)
            throw new Error('Incorrect email or password.');
        const session = { name: found.name, email: found.email };
        await AsyncStorage.setItem(KEYS.session, JSON.stringify(session));
        setUser(session);
    }, []);
    const signup = useCallback(async (name, email, password) => {
        const users = await readUsers();
        const normalized = email.trim().toLowerCase();
        if (users.some((u) => u.email === normalized))
            throw new Error('An account with this email already exists.');
        const newUser = { name: name.trim(), email: normalized, password };
        await AsyncStorage.setItem(KEYS.users, JSON.stringify([...users, newUser]));
        const session = { name: newUser.name, email: newUser.email };
        await AsyncStorage.setItem(KEYS.session, JSON.stringify(session));
        setUser(session);
    }, []);
    const logout = useCallback(async () => {
        await AsyncStorage.removeItem(KEYS.session);
        setUser(null);
    }, []);
    const value = useMemo(() => ({ ready, onboarded, user, completeOnboarding, login, signup, logout }), [ready, onboarded, user, completeOnboarding, login, signup, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
