import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { BiometricOptInModal } from '@/components/BiometricOptInModal';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/lib/auth-context';
import { syncProfile } from '@/lib/api-client';
import type { Session } from '@pivotly/types';
import { getStoredSession } from '@/lib/neon-auth-client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const {
    signIn,
    loading: authLoading,
    error: authError,
    clearError,
    biometricStatus,
    biometricEnabled,
    tryBiometricLogin,
    enableBiometric,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingSession, setPendingSession] = useState<Session | null>(null);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email.trim())) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    if (typeof clearError === 'function') clearError();
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSyncError(null);
    try {
      const session = await signIn(email.trim(), password);
      if (!session?.user) return;
      const syncResult = await syncProfile(
        session.user.id,
        session.user.email,
        session.user.name ?? undefined
      );
      if (!syncResult.ok) {
        setSyncError('Profile sync: ' + syncResult.error);
        return;
      }
      if (session && biometricStatus?.available && !biometricEnabled) {
        setPendingSession(session);
        setShowBiometricModal(true);
      } else {
        router.replace(('/(tabs)') as import('expo-router').Href);
      }
    } catch {
      // Auth (sign-in) failed — error is already set in context (e.g. "Network request failed")
    } finally {
      setSubmitting(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const ok = await tryBiometricLogin();
      if (!ok) return;
      const stored = await getStoredSession();
      if (!stored?.user) return;
      const syncResult = await syncProfile(
        stored.user.id,
        stored.user.email,
        stored.user.name ?? undefined
      );
      if (!syncResult.ok) {
        setSyncError('Profile sync: ' + syncResult.error);
        return;
      }
      router.replace(('/(tabs)') as import('expo-router').Href);
    } finally {
      setBiometricLoading(false);
    }
  };

  const showBiometricButton =
    biometricStatus?.available &&
    !authLoading &&
    !submitting;

  const isLoading = authLoading || submitting || biometricLoading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 24 + insets.top }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: t.text }]}>Login</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Sign in to continue to your feed.
        </Text>
        {showBiometricButton ? (
          <Pressable
            onPress={handleBiometricLogin}
            disabled={isLoading}
            style={({ pressed }: { pressed: boolean }) => [
              styles.biometricBtn,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <MaterialIcons
              name={biometricStatus?.type === 'face' ? 'face' : 'fingerprint'}
              size={28}
              color={t.accent}
              style={styles.biometricIcon}
            />
            <Text style={[styles.biometricBtnText, { color: t.text }]}>
              Login with {biometricStatus?.label}
            </Text>
          </Pressable>
        ) : null}
        <NeonInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        <NeonInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          editable={!isLoading}
        />
        <Pressable
          onPress={() => router.push(('/forgot-password') as import('expo-router').Href)}
          disabled={isLoading}
          style={styles.forgotLinkWrap}
        >
          <Text style={[styles.forgotLink, { color: t.accent }]}>Forgot password?</Text>
        </Pressable>
        {authError ? (
          <View style={[styles.errorBanner, { backgroundColor: t.surface, borderColor: t.error }]}>
            <Text style={[styles.errorText, { color: t.error }]}>Sign-in: {authError}</Text>
          </View>
        ) : null}
        {syncError ? (
          <View style={[styles.errorBanner, { backgroundColor: t.surface, borderColor: t.error }]}>
            <Text style={[styles.errorText, { color: t.error }]}>{syncError}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <NeonButton
            title={isLoading ? 'Signing in…' : 'Sign in'}
            variant="primary"
            fullWidth
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.primaryBtn}
          />
          {isLoading ? (
            <ActivityIndicator size="small" color={t.accent} style={styles.loader} />
          ) : null}
          <NeonButton
            title="Back"
            variant="ghost"
            fullWidth
            onPress={() => router.back()}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
      <BiometricOptInModal
        visible={showBiometricModal}
        biometricLabel={biometricStatus?.label ?? 'Face ID / Fingerprint'}
        onEnable={async () => {
          if (!pendingSession) return { success: false, error: 'Session missing.' };
          return enableBiometric(pendingSession);
        }}
        onSkip={() => {
          setShowBiometricModal(false);
          setPendingSession(null);
          router.replace(('/(tabs)') as import('expo-router').Href);
        }}
        onSuccess={() => {
          setShowBiometricModal(false);
          setPendingSession(null);
          router.replace(('/(tabs)') as import('expo-router').Href);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { fontSize: 14 },
  actions: { marginTop: 8, gap: 12 },
  primaryBtn: { marginTop: 8 },
  loader: { marginVertical: 8 },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  biometricIcon: { marginRight: 10 },
  biometricBtnText: { fontSize: 16, fontWeight: '600' },
  forgotLinkWrap: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 16, padding: 8 },
  forgotLink: { fontSize: 15, fontWeight: '500' },
});
