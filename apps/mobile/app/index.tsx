/**
 * Root entry: auth gate. Shows splash while loading, then syncs profile and redirects to home or main.
 * App does not proceed to home until profile sync succeeds.
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { syncProfile } from '@/lib/api-client';
import { SplashScreen } from '@/screens/SplashScreen';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function IndexRoute() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const t = useAppTheme();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runProfileSync = useCallback(async () => {
    if (!user) return false;
    setSyncError(null);
    setSyncing(true);
    const result = await syncProfile(user.id, user.email, user.username ?? user.name ?? undefined);
    setSyncing(false);
    if (result.ok) {
      return true;
    }
    setSyncError(result.error);
    return false;
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(('/main') as import('expo-router').Href);
      return;
    }
    (async () => {
      const ok = await runProfileSync();
      if (!mountedRef.current) return;
      if (ok) {
        router.replace(('/(tabs)') as import('expo-router').Href);
      }
    })();
  }, [authLoading, user, router, runProfileSync]);

  const handleRetry = async () => {
    const ok = await runProfileSync();
    if (ok) {
      router.replace(('/(tabs)') as import('expo-router').Href);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSyncError(null);
    router.replace(('/main') as import('expo-router').Href);
  };

  if (syncError && !syncing) {
    return (
      <View style={[styles.container, { backgroundColor: t.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: t.text }]}>Profile sync failed</Text>
          <Text style={[styles.message, { color: t.textSecondary }]}>{syncError}</Text>
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: t.accent },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.buttonSecondary,
              { borderColor: t.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.buttonSecondaryText, { color: t.textSecondary }]}>Sign out</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (syncing) {
    return (
      <View style={[styles.container, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.syncingText, { color: t.textSecondary }]}>Syncing profile…</Text>
      </View>
    );
  }

  return <SplashScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  syncingText: {
    marginTop: 16,
    fontSize: 15,
  },
});
