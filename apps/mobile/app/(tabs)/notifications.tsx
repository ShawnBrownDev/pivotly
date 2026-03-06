import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function NotificationsTab() {
  const insets = useSafeAreaInsets();
  const t = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.background, paddingTop: 24 + insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Notifications</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Activity on your ideas and account
        </Text>
      </View>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MaterialIcons name="notifications-none" size={40} color={t.textMuted} />
        </View>
        <Text style={[styles.placeholderTitle, { color: t.text }]}>No notifications yet</Text>
        <Text style={[styles.placeholderSubtitle, { color: t.textSecondary }]}>
          When someone likes, dislikes, or comments on your ideas—or when you get friend
          requests—they’ll show up here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
});
