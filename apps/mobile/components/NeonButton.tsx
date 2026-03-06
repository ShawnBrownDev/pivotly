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
import { useAppTheme } from '@/hooks/use-app-theme';

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
  const t = useAppTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'primary' && [
          styles.primary,
          { backgroundColor: t.surface, borderColor: t.accent },
          pressed && { opacity: 0.92, borderColor: t.accentHover },
        ],
        variant === 'secondary' && [
          styles.secondary,
          { borderColor: t.accentMuted },
          pressed && { opacity: 0.92 },
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
          { color: variant === 'ghost' ? t.textSecondary : t.accent },
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
    borderWidth: 1.5,
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
