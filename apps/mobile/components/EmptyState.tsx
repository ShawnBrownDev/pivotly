import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '@/hooks/use-app-theme';

type EmptyStateProps = {
  title: string;
  subtitle?: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  const t = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: t.surface, borderColor: t.border }]}>
        <MaterialIcons name="lightbulb-outline" size={32} color={t.textMuted} />
      </View>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
});
