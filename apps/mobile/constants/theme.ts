/**
 * Theme synced from global.css. Light and dark entries match :root and .dark:root in HSL format.
 */

import { Platform } from 'react-native';

/** Source of truth: apps/mobile/global.css */
export const THEME = {
  light: {
    background: 'hsl(0, 0%, 100%)',
    backgroundSecondary: 'hsl(0, 0%, 98%)',
    surface: 'hsl(0, 0%, 96%)',
    surfaceElevated: 'hsl(0, 0%, 99%)',
    text: 'hsl(220, 15%, 10%)',
    textSecondary: 'hsl(220, 10%, 40%)',
    textMuted: 'hsl(220, 8%, 55%)',
    neon: 'hsl(173, 80%, 50%)',
    neonGlow: 'hsl(173, 80%, 50%)',
    neonMuted: 'hsl(173, 60%, 45%)',
    border: 'hsl(220, 15%, 88%)',
    borderFocus: 'hsl(173, 80%, 50%)',
    inputBg: 'hsl(0, 0%, 100%)',
    success: 'hsl(142, 70%, 45%)',
    error: 'hsl(0, 72%, 51%)',
    warning: 'hsl(38, 92%, 50%)',
  },
  dark: {
    background: 'hsl(224, 25%, 8%)',
    backgroundSecondary: 'hsl(224, 20%, 11%)',
    surface: 'hsl(224, 22%, 14%)',
    surfaceElevated: 'hsl(224, 20%, 17%)',
    text: 'hsl(210, 20%, 96%)',
    textSecondary: 'hsl(210, 15%, 75%)',
    textMuted: 'hsl(210, 12%, 55%)',
    neon: 'hsl(173, 80%, 50%)',
    neonGlow: 'hsl(173, 85%, 55%)',
    neonMuted: 'hsl(173, 55%, 42%)',
    border: 'hsl(224, 18%, 22%)',
    borderFocus: 'hsl(173, 80%, 50%)',
    inputBg: 'hsl(224, 22%, 12%)',
    success: 'hsl(142, 65%, 45%)',
    error: 'hsl(0, 70%, 52%)',
    warning: 'hsl(38, 90%, 52%)',
  },
} as const;

export const NAV_THEME = {
  light: {
    primary: THEME.light.neon,
    background: THEME.light.background,
    card: THEME.light.surface,
    text: THEME.light.text,
    border: THEME.light.border,
  },
  dark: {
    primary: THEME.dark.neon,
    background: THEME.dark.background,
    card: THEME.dark.surface,
    text: THEME.dark.text,
    border: THEME.dark.border,
  },
} as const;

/** @deprecated Use THEME.light / THEME.dark for new code. Kept for existing useThemeColor. */
export const Colors = {
  light: {
    text: THEME.light.text,
    background: THEME.light.background,
    tint: THEME.light.neon,
    icon: THEME.light.textSecondary,
    tabIconDefault: THEME.light.textMuted,
    tabIconSelected: THEME.light.neon,
  },
  dark: {
    text: THEME.dark.text,
    background: THEME.dark.background,
    tint: THEME.dark.neon,
    icon: THEME.dark.textSecondary,
    tabIconDefault: THEME.dark.textMuted,
    tabIconSelected: THEME.dark.neon,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});