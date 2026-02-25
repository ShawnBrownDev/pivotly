import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonButton } from '@/components/NeonButton';
import { THEME } from '@/constants/theme';

export function MainScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = THEME.dark;

  return (
    <View style={[styles.container, { backgroundColor: t.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>Welcome to Pivotly</Text>
        <Text style={[styles.description, { color: t.textSecondary }]}>
          Test your idea with real feedback before you invest time and money. Get validation scores, see what others think, and decide if it’s worth building.
        </Text>
        <View style={styles.buttons}>
          <NeonButton
            title="Sign Up"
            variant="primary"
            fullWidth
            onPress={() => router.push(('/sign-up') as import('expo-router').Href)}
            style={styles.button}
          />
          <NeonButton
            title="Login"
            variant="secondary"
            fullWidth
            onPress={() => router.push(('/login') as import('expo-router').Href)}
            style={styles.button}
          />
        </View>
        <NeonButton
          title="See Demo Ideas"
          variant="ghost"
          onPress={() => router.push(('/home') as import('expo-router').Href)}
          style={styles.demoLink}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  buttons: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    marginBottom: 0,
  },
  demoLink: {
    alignSelf: 'center',
  },
});
