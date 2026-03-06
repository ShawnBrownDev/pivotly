/**
 * Theme synced from global.css. Light and dark entries match :root and .dark:root in HSL format.
 * Professional palette: dark charcoal, muted indigo/blue accent (no neon glow).
 */

import { Platform } from 'react-native';

/** Source of truth: apps/mobile/global.css */
export const THEME = {
  light: {
    background: 'hsl(0, 0%, 100%)',
    backgroundSecondary: 'hsl(220, 15%, 98%)',
    surface: 'hsl(220, 15%, 96%)',
    surfaceElevated: 'hsl(0, 0%, 99%)',
    text: 'hsl(220, 18%, 12%)',
    textSecondary: 'hsl(220, 12%, 38%)',
    textMuted: 'hsl(220, 10%, 52%)',
    accent: 'hsl(230, 55%, 52%)',
    accentHover: 'hsl(230, 55%, 48%)',
    accentMuted: 'hsl(230, 40%, 45%)',
    border: 'hsl(220, 15%, 88%)',
    borderFocus: 'hsl(230, 55%, 52%)',
    inputBg: 'hsl(0, 0%, 100%)',
    success: 'hsl(142, 55%, 42%)',
    error: 'hsl(0, 65%, 48%)',
    warning: 'hsl(38, 85%, 48%)',
    /** @deprecated Use accent. Kept for compatibility. */
    neon: 'hsl(230, 55%, 52%)',
    neonGlow: 'hsl(230, 55%, 58%)',
    neonMuted: 'hsl(230, 40%, 45%)',
  },
  dark: {
    background: 'hsl(222, 24%, 7%)',
    backgroundSecondary: 'hsl(222, 22%, 9%)',
    surface: 'hsl(222, 20%, 12%)',
    surfaceElevated: 'hsl(222, 18%, 15%)',
    text: 'hsl(210, 22%, 95%)',
    textSecondary: 'hsl(210, 18%, 72%)',
    textMuted: 'hsl(210, 14%, 55%)',
    accent: 'hsl(231, 55%, 58%)',
    accentHover: 'hsl(231, 55%, 65%)',
    accentMuted: 'hsl(231, 35%, 48%)',
    border: 'hsl(222, 18%, 20%)',
    borderFocus: 'hsl(231, 55%, 58%)',
    inputBg: 'hsl(222, 22%, 10%)',
    success: 'hsl(142, 50%, 44%)',
    error: 'hsl(0, 62%, 50%)',
    warning: 'hsl(38, 82%, 50%)',
    /** @deprecated Use accent. Kept for compatibility. */
    neon: 'hsl(231, 55%, 58%)',
    neonGlow: 'hsl(231, 55%, 65%)',
    neonMuted: 'hsl(231, 35%, 48%)',
  },
} as const;

export const NAV_THEME = {
  light: {
    primary: THEME.light.accent,
    background: THEME.light.background,
    card: THEME.light.surface,
    text: THEME.light.text,
    border: THEME.light.border,
  },
  dark: {
    primary: THEME.dark.accent,
    background: THEME.dark.background,
    card: THEME.dark.surface,
    text: THEME.dark.text,
    border: THEME.dark.border,
  },
} as const;

/** @deprecated Use THEME.light / THEME.dark for new code. */
export const Colors = {
  light: {
    text: THEME.light.text,
    background: THEME.light.background,
    tint: THEME.light.accent,
    icon: THEME.light.textSecondary,
    tabIconDefault: THEME.light.textMuted,
    tabIconSelected: THEME.light.accent,
  },
  dark: {
    text: THEME.dark.text,
    background: THEME.dark.background,
    tint: THEME.dark.accent,
    icon: THEME.dark.textSecondary,
    tabIconDefault: THEME.dark.textMuted,
    tabIconSelected: THEME.dark.accent,
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
