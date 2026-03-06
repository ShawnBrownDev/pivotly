import { THEME } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

/**
 * Returns current theme mode. App uses dark theme by default for a consistent professional look.
 */
export function useThemeMode(): ThemeMode {
  return 'dark';
}

/**
 * Returns the theme object for the current color scheme.
 */
export function useAppTheme() {
  const mode = useThemeMode();
  return THEME[mode];
}
