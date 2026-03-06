/**
 * Expo app config — valid for App Store and Play Store submission.
 * Do not hardcode secrets here; use EAS Secrets or environment variables for sensitive values.
 */
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Pivotly',
  slug: 'pivotly',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pivotly',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.pivotly.app',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    package: 'com.pivotly.app',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-secure-store',
      {
        faceIDPermission:
          'Use Face ID to securely log into your Pivotly account.',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '501c05a0-1d0a-48da-b995-a4aa7ba4ed43',
    },
  },
  owner: 'shawnbrown1',
};

export default config;
