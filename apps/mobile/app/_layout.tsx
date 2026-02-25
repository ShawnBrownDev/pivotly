import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { NAV_THEME } from '@/constants/theme';

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

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkNavTheme}>
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
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="home" />
        </Stack>
        <StatusBar style="light" />
    </ThemeProvider>
    </SafeAreaProvider>
  );
}
