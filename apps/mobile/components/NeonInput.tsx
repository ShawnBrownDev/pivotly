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
import { THEME } from '@/constants/theme';

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
  const t = THEME.dark;

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
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputFocused: {
    shadowColor: 'hsl(173, 80%, 50%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
