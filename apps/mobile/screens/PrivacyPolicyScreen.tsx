import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { useAppTheme } from '@/hooks/use-app-theme';

export function PrivacyPolicyScreen() {
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
        <Text style={[styles.title, { color: t.text }]}>Privacy Policy</Text>
        <Text style={[styles.updated, { color: t.textMuted }]}>
          Last updated: February 2025
        </Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          Pivotly (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This policy describes what data we collect and how we use it.
        </Text>
        <Text style={[styles.heading, { color: t.text }]}>Data we collect</Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          When you use Pivotly, we may collect: account information you provide (email, username) if you create an account; usage data such as how you interact with the app; and device information necessary for the app to function. We do not collect more personal data than needed for the service.
        </Text>
        <Text style={[styles.heading, { color: t.text }]}>How we use data</Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          We use your data to provide and improve the app, to communicate with you about your account, and to comply with legal obligations. We do not sell your personal data to third parties.
        </Text>
        <Text style={[styles.heading, { color: t.text }]}>Your choices</Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          You can request access to your data, correction, or deletion at any time. Use the Delete Account option in Profile or contact us. Creating an account is optional; you may browse demo content without signing up.
        </Text>
        <Text style={[styles.paragraph, { color: t.textSecondary }]}>
          This is placeholder content. Before launch, replace with your full legal Privacy Policy and have it reviewed.
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
