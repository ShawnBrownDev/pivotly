import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { THEME } from '@/constants/theme';

const SPLASH_DURATION_MS = 1800;

export function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      router.replace(('/main') as import('expo-router').Href);
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [fadeAnim, router]);

  const t = THEME.dark;

  return (
    <LinearGradient
      colors={[t.background, t.backgroundSecondary, t.surface]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: fadeAnim,
            shadowColor: t.neon,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 24,
            elevation: 8,
          },
        ]}
      >
        <Text style={[styles.logo, { color: t.neon }]}>Pivotly</Text>
      </Animated.View>
      <Animated.Text style={[styles.tagline, { color: t.textSecondary, opacity: fadeAnim }]}>
        Validate your startup idea before you build it
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});
