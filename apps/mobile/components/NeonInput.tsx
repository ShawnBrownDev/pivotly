import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';

type NeonInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function NeonInput({
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...inputProps
}: NeonInputProps) {
  const [focused, setFocused] = useState(false);
  const t = useAppTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: t.textSecondary }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={t.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: t.inputBg,
            borderColor: focused ? t.borderFocus : t.border,
            color: t.text,
          },
          focused && styles.inputFocused,
          error && { borderColor: t.error },
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...inputProps}
      />
      {error ? (
        <Text style={[styles.error, { color: t.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputFocused: {
    borderWidth: 2,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
