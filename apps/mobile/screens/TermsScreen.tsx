import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { useAppTheme } from '@/hooks/use-app-theme';

export function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 16 + insets.top, paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: t.text }]}>Terms of Service</Text>
        <Text style={[styles.updated, { color: t.textMuted }]}>
          Last updated: February 2025
        </Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          Welcome to Pivotly. By using our app you agree to these terms. Please read them carefully.
        </Text>
        <Text style={[styles.heading, { color: t.text }]}>Use of the service</Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          You may use Pivotly to explore and validate startup ideas. You agree to use the app only for lawful purposes and not to misuse or abuse the service or other users.
        </Text>
        <Text style={[styles.heading, { color: t.text }]}>Account</Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          Account creation is optional. If you create an account, you are responsible for keeping your credentials secure. You may request account deletion at any time from within the app or by contacting us.
        </Text>
        <Text style={[styles.heading, { color: t.text }]}>Changes</Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          We may update these terms from time to time. Continued use of the app after changes constitutes acceptance. Material changes will be communicated in the app or by email where appropriate.
        </Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          This is placeholder content. Before launch, replace with your full legal Terms of Service and have them reviewed.
        </Text>
        <NeonButton
          title="Back"
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  updated: { fontSize: 14, marginBottom: 20 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  paragraph: { fontSize: 16, lineHeight: 24, marginBottom: 12 },
  backBtn: { marginTop: 24, alignSelf: 'flex-start' },
});
