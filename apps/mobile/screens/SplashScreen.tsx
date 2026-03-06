import React, { useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-app-theme';

/**
 * Presentational splash. Navigation is handled by the parent (index route) based on auth state.
 */
export function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const t = useAppTheme();

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
            shadowColor: t.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          },
        ]}
      >
        <Text style={[styles.logo, { color: t.accent }]}>Pivotly</Text>
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
