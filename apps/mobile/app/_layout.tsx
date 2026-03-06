import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { NAV_THEME } from '@/constants/theme';
import { setOn401Callback } from '@/lib/api-client';
import { AuthProvider, useAuth } from '@/lib/auth-context';

const DarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: NAV_THEME.dark.primary,
    background: NAV_THEME.dark.background,
    card: NAV_THEME.dark.card,
    text: NAV_THEME.dark.text,
    border: NAV_THEME.dark.border,
    notification: NAV_THEME.dark.primary,
  },
};

function AuthApiBridge({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuth();
  useEffect(() => {
    setOn401Callback(() => {
      signOut();
      router.replace(('/main') as import('expo-router').Href);
      Alert.alert('Session expired', 'Please sign in again.');
    });
    return () => setOn401Callback(null);
  }, [signOut, router]);
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={DarkNavTheme}>
          <AuthApiBridge>
            <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: NAV_THEME.dark.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="main" />
            <Stack.Screen name="login" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="home" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="terms" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="post-idea" />
            <Stack.Screen name="idea/[id]" />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal' }}
            />
          </Stack>
          <StatusBar style="light" />
        </AuthApiBridge>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
