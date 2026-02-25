import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { THEME } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type NeonButtonProps = PressableProps & {
  title: string;
  variant?: Variant;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function NeonButton({
  title,
  variant = 'primary',
  fullWidth,
  style,
  textStyle,
  disabled,
  ...pressableProps
}: NeonButtonProps) {
  const t = THEME.dark;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'primary' && [
          styles.primary,
          { backgroundColor: t.surface, borderColor: t.neon },
          pressed && { opacity: 0.9, borderColor: t.neonGlow },
        ],
        variant === 'secondary' && [
          styles.secondary,
          { borderColor: t.neonMuted },
          pressed && { opacity: 0.9 },
        ],
        variant === 'ghost' && [
          styles.ghost,
          pressed && { opacity: 0.8 },
        ],
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...pressableProps}
    >
      <Text
        style={[
          styles.text,
          { color: variant === 'ghost' ? t.textSecondary : t.neon },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  primary: {},
  secondary: {
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
  },
});
