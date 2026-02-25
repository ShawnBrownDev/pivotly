import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { THEME } from '@/constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  const validate = () => {
    const next: { username?: string; email?: string; password?: string } = {};
    if (!username.trim()) next.username = 'Username is required';
    else if (username.trim().length < 3) next.username = 'At least 3 characters';
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email.trim())) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignUp = () => {
    if (!validate()) return;
    router.replace(('/home') as import('expo-router').Href);
  };

  const t = THEME.dark;

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
        <Text style={[styles.title, { color: t.text }]}>Sign Up</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Create an account to save ideas and join the community.
        </Text>
        <NeonInput
          label="Username"
          placeholder="johndoe"
          value={username}
          onChangeText={setUsername}
          error={errors.username}
          autoCapitalize="none"
          autoCorrect={false}
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
        />
        <NeonInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />
        <View style={styles.actions}>
          <NeonButton
            title="Sign Up → Home Feed"
            variant="primary"
            fullWidth
            onPress={handleSignUp}
            style={styles.primaryBtn}
          />
          <NeonButton
            title="Back"
            variant="ghost"
            fullWidth
            onPress={() => router.back()}
          />
          <Pressable onPress={() => router.replace(('/login') as import('expo-router').Href)} style={styles.loginLinkWrap}>
            <Text style={[styles.loginLink, { color: t.neon }]}>
              Already have an account? Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  primaryBtn: {
    marginTop: 8,
  },
  loginLinkWrap: {
    alignSelf: 'center',
    marginTop: 8,
    padding: 8,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '500',
  },
});
