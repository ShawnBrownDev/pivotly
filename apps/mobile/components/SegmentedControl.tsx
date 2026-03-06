import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';

export type SegmentOption<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const t = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.surface, borderColor: t.border }]}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.segment,
              isSelected && [styles.segmentSelected, { backgroundColor: t.background }],
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: isSelected ? t.text : t.textMuted },
                isSelected && styles.segmentLabelSelected,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {},
  segmentPressed: {
    opacity: 0.9,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  segmentLabelSelected: {
    fontWeight: '600',
  },
});
