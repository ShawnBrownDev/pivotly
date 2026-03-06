import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { useAppTheme } from '@/hooks/use-app-theme';
import { resetPassword } from '@/lib/neon-auth-client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle deep link: pivotly://reset-password?token=xxx may set URL after mount
  useEffect(() => {
    const handleUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        const t = parsed.searchParams.get('token');
        if (t) setToken(t);
      } catch {
        // ignore
      }
    };
    Linking.getInitialURL().then((url) => url && handleUrl(url));
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  const validate = () => {
    setError(null);
    if (!token.trim()) {
      setError('Reset link is invalid or expired. Request a new link from the Forgot password screen.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await resetPassword(token.trim(), password);
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: t.background, paddingTop: insets.top + 24 }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: t.text }]}>Password reset</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            Your password has been updated. Sign in with your new password.
          </Text>
          <NeonButton
            title="Sign in"
            variant="primary"
            fullWidth
            onPress={() => router.replace(('/login') as import('expo-router').Href)}
            style={styles.button}
          />
        </ScrollView>
      </View>
    );
  }

  if (!token.trim()) {
    return (
      <View style={[styles.container, { backgroundColor: t.background, paddingTop: insets.top + 24 }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: t.text }]}>Reset password</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            Open the link from your reset email to set a new password. If the link expired, request a new one from the Forgot password screen.
          </Text>
          <NeonButton
            title="Back to login"
            variant="primary"
            fullWidth
            onPress={() => router.replace(('/login') as import('expo-router').Href)}
            style={styles.button}
          />
        </ScrollView>
      </View>
    );
  }

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
        <Text style={[styles.title, { color: t.text }]}>Set new password</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Enter your new password below.
        </Text>
        <NeonInput
          label="New password"
          placeholder="••••••••"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          error={error && !confirm ? error : undefined}
          secureTextEntry
          editable={!submitting}
        />
        <NeonInput
          label="Confirm password"
          placeholder="••••••••"
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            setError(null);
          }}
          error={error && confirm ? error : undefined}
          secureTextEntry
          editable={!submitting}
        />
        {error && password && confirm ? (
          <View style={[styles.errorBanner, { backgroundColor: t.surface, borderColor: t.error }]}>
            <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <NeonButton
            title={submitting ? 'Updating…' : 'Update password'}
            variant="primary"
            fullWidth
            onPress={handleSubmit}
            disabled={submitting}
            style={styles.primaryBtn}
          />
          {submitting ? (
            <ActivityIndicator size="small" color={t.accent} style={styles.loader} />
          ) : null}
          <NeonButton
            title="Back to login"
            variant="ghost"
            fullWidth
            onPress={() => router.replace(('/login') as import('expo-router').Href)}
            disabled={submitting}
          />
        </View>
      </ScrollView>
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
  button: { marginTop: 24 },
});
