import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { useAppTheme } from '@/hooks/use-app-theme';
import { forgotPassword } from '@/lib/neon-auth-client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Enter a valid email');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await forgotPassword(email.trim());
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
          <Text style={[styles.title, { color: t.text }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            If an account exists for {email}, you'll receive a link to reset your password.
          </Text>
          <NeonButton
            title="Back to login"
            variant="primary"
            fullWidth
            onPress={() => router.back()}
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
        <Text style={[styles.title, { color: t.text }]}>Forgot password</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Enter your email and we'll send you a link to reset your password.
        </Text>
        <NeonInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          error={error ?? undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
        />
        <View style={styles.actions}>
          <NeonButton
            title={submitting ? 'Sending…' : 'Send reset link'}
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
            title="Back"
            variant="ghost"
            fullWidth
            onPress={() => router.back()}
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
  actions: { marginTop: 8, gap: 12 },
  primaryBtn: { marginTop: 8 },
  loader: { marginVertical: 8 },
  button: { marginTop: 24 },
});
