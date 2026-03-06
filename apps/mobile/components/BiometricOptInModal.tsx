/**
 * Modal shown after signup or login to optionally enable biometric (Face ID / Touch ID / Fingerprint).
 * Only shown when hardware is available and enrolled; no automatic enabling without user consent.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { NeonButton } from '@/components/NeonButton';

export type BiometricOptInModalProps = {
  visible: boolean;
  /** Platform label, e.g. "Face ID" or "Fingerprint" */
  biometricLabel: string;
  /** Called when user taps Enable. Return { success: true } or { success: false, error } */
  onEnable: () => Promise<{ success: boolean; error?: string }>;
  /** Called when user taps Not Now */
  onSkip: () => void;
  /** Called after successful enable (navigate to home, etc.) */
  onSuccess: () => void;
};

export function BiometricOptInModal({
  visible,
  biometricLabel,
  onEnable,
  onSkip,
  onSuccess,
}: BiometricOptInModalProps) {
  const t = useAppTheme();
  const { width } = useWindowDimensions();
  const [enabling, setEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    setError(null);
    setEnabling(true);
    try {
      const result = await onEnable();
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error ?? 'Could not enable. Try again later.');
      }
    } catch {
      setError('Something went wrong. You can enable it later in Profile.');
    } finally {
      setEnabling(false);
    }
  };

  const handleSkip = () => {
    setError(null);
    onSkip();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: t.surface,
              borderColor: t.border,
              maxWidth: Math.min(width - 48, 360),
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <MaterialIcons name="fingerprint" size={48} color={t.accent} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>
            Enable {biometricLabel} for faster login?
          </Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            Sign in next time with {biometricLabel} instead of your password. You can change this
            anytime in Profile.
          </Text>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: t.background, borderColor: t.error }]}>
              <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            <NeonButton
              title={enabling ? 'Enabling…' : 'Enable'}
              variant="primary"
              fullWidth
              onPress={handleEnable}
              disabled={enabling}
              style={styles.button}
            />
            {enabling ? (
              <ActivityIndicator size="small" color={t.accent} style={styles.loader} />
            ) : null}
            <NeonButton
              title="Not now"
              variant="ghost"
              fullWidth
              onPress={handleSkip}
              disabled={enabling}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    marginBottom: 0,
  },
  loader: {
    marginVertical: 4,
  },
});
