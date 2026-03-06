import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/lib/auth-context';
import { getStoredSession } from '@/lib/neon-auth-client';

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const {
    user,
    signOut,
    biometricStatus,
    biometricEnabled,
    disableBiometric,
    enableBiometric,
  } = useAuth();
  const [biometricToggling, setBiometricToggling] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Account deletion is not yet available in this build. To request deletion of your data, please contact support with your account email. We will process requests within 30 days.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccountPress = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to request account deletion? Your data will be removed in accordance with our Privacy Policy.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Deletion', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 16 + insets.top, paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: t.text }]}>Profile</Text>
        {user ? (
          <>
            <Text style={[styles.subtitle, { color: t.textSecondary }]}>
              {user.email}
            </Text>
            {user.username ? (
              <Text style={[styles.subtitle, { color: t.textMuted }]}>
                @{user.username}
              </Text>
            ) : null}
          {biometricStatus?.available ? (
            <View style={[styles.biometricRow, { borderColor: t.border }]}>
              <Text style={[styles.biometricLabel, { color: t.text }]}>
                Enable {biometricStatus.label} Login
              </Text>
              {biometricToggling ? (
                <ActivityIndicator size="small" color={t.accent} />
              ) : (
                <Switch
                  value={biometricEnabled}
                  onValueChange={async (value) => {
                    setBiometricToggling(true);
                    try {
                      if (value) {
                        const stored = await getStoredSession();
                        if (stored) {
                          const result = await enableBiometric(stored);
                          if (!result.success && result.error) {
                            Alert.alert('Could not enable', result.error);
                          }
                        }
                      } else {
                        await disableBiometric();
                      }
                    } finally {
                      setBiometricToggling(false);
                    }
                  }}
                  trackColor={{ false: t.surface, true: t.accentMuted }}
                  thumbColor={biometricEnabled ? t.accent : t.textMuted}
                />
              )}
            </View>
          ) : null}
          <NeonButton
            title="Sign out"
            variant="secondary"
            fullWidth
            onPress={() => signOut().then(() => router.replace(('/main') as import('expo-router').Href))}
            style={styles.button}
          />
          </>
        ) : (
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            Sign in or create an account to save ideas and sync across devices.
          </Text>
        )}
        <Text style={[styles.sectionTitle, { color: t.text }]}>Account & privacy</Text>
        <NeonButton
          title="Delete Account"
          variant="ghost"
          fullWidth
          onPress={handleDeleteAccountPress}
          style={[styles.button, styles.deleteButton]}
        />
        <Text style={[styles.hint, { color: t.textMuted }]}>
          Required by app store policies when user accounts exist. Contact support to complete deletion until in-app flow is available.
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
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  biometricLabel: { fontSize: 16, fontWeight: '500' },
  button: { marginBottom: 12 },
  deleteButton: {},
  hint: { fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 8 },
  backBtn: { marginTop: 24, alignSelf: 'flex-start' },
});
