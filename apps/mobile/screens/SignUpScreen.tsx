import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { BiometricOptInModal } from '@/components/BiometricOptInModal';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/lib/auth-context';
import { syncProfile } from '@/lib/api-client';
import type { Session } from '@pivotly/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const {
    signUp,
    loading: authLoading,
    error: authError,
    clearError,
    biometricStatus,
    biometricEnabled,
    enableBiometric,
  } = useAuth();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingSession, setPendingSession] = useState<Session | null>(null);

  const validate = () => {
    const next: {
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    } = {};
    if (!username.trim()) next.username = 'Username is required';
    else if (username.trim().length < 3) next.username = 'At least 3 characters';
    if (!firstName.trim()) next.firstName = 'First name is required';
    if (!lastName.trim()) next.lastName = 'Last name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email.trim())) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    if (typeof clearError === 'function') clearError();
    return Object.keys(next).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSyncError(null);
    try {
      const session = await signUp(email.trim(), password, username.trim() || undefined);
      if (!session?.user) return;
      const syncResult = await syncProfile(
        session.user.id,
        session.user.email,
        username.trim() || undefined,
        firstName.trim() || undefined,
        lastName.trim() || undefined
      );
      if (!syncResult.ok) {
        setSyncError(syncResult.error);
        return;
      }
      if (session && biometricStatus?.available && !biometricEnabled) {
        setPendingSession(session);
        setShowBiometricModal(true);
      } else {
        router.replace(('/(tabs)') as import('expo-router').Href);
      }
    } catch {
      // Error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = authLoading || submitting;

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
        <Text style={[styles.title, { color: t.text }]}>Sign up</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Create an account to save ideas and join the community.
        </Text>
        <NeonInput
          label="First name"
          placeholder="Jane"
          value={firstName}
          onChangeText={setFirstName}
          error={errors.firstName}
          autoCapitalize="words"
          editable={!isLoading}
        />
        <NeonInput
          label="Last name"
          placeholder="Doe"
          value={lastName}
          onChangeText={setLastName}
          error={errors.lastName}
          autoCapitalize="words"
          editable={!isLoading}
        />
        <NeonInput
          label="Username"
          placeholder="johndoe"
          value={username}
          onChangeText={setUsername}
          error={errors.username}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
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
        <View style={[styles.legalRow, { borderColor: t.border }]}>
          <Text style={[styles.legalText, { color: t.textSecondary }]}>
            By signing up you agree to our{' '}
            <Text style={[styles.link, { color: t.accent }]} onPress={() => router.push('/privacy' as import('expo-router').Href)}>
              Privacy Policy
            </Text>
            {' '}and{' '}
            <Text style={[styles.link, { color: t.neon }]} onPress={() => router.push('/terms' as import('expo-router').Href)}>
              Terms of Service
            </Text>.
          </Text>
        </View>
        {authError ? (
          <View style={[styles.errorBanner, { backgroundColor: t.surface, borderColor: t.error }]}>
            <Text style={[styles.errorText, { color: t.error }]}>{authError}</Text>
          </View>
        ) : null}
        {syncError ? (
          <View style={[styles.errorBanner, { backgroundColor: t.surface, borderColor: t.error }]}>
            <Text style={[styles.errorText, { color: t.error }]}>{syncError}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <NeonButton
            title={isLoading ? 'Creating account…' : 'Create account'}
            variant="primary"
            fullWidth
            onPress={handleSignUp}
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
          <Pressable
            onPress={() => router.replace(('/login') as import('expo-router').Href)}
            style={styles.loginLinkWrap}
            disabled={isLoading}
          >
            <Text style={[styles.loginLink, { color: t.accent }]}>
              Already have an account? Sign in
            </Text>
          </Pressable>
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
  legalRow: { marginTop: 8, paddingVertical: 12, borderTopWidth: 1 },
  legalText: { fontSize: 14, lineHeight: 20 },
  link: { fontWeight: '600' },
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
  loginLinkWrap: { alignSelf: 'center', marginTop: 8, padding: 8 },
  loginLink: { fontSize: 15, fontWeight: '500' },
});
