import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { THEME } from '@/constants/theme';

export type IdeaCardData = {
  id: string;
  username: string;
  /** Author display name (e.g. "First Last") shown above @username when present */
  displayName?: string;
  timestamp: string;
  title: string;
  description: string;
  validationScore: number;
  monetization: number;
  difficulty: number;
  upvotes: number;
  downvotes: number;
  comments: number;
};

type ThemeSlice = {
  text: string;
  textSecondary: string;
  textMuted: string;
  surface: string;
  border: string;
  accent: string;
  accentMuted: string;
  background?: string;
};

type IdeaCardProps = {
  idea: IdeaCardData;
  onPress?: (id: string) => void;
  onUpvote?: (id: string) => void;
  onDownvote?: (id: string) => void;
  theme?: ThemeSlice;
};

export function IdeaCard({ idea, onPress, onUpvote, onDownvote, theme: themeProp }: IdeaCardProps) {
  const t = themeProp ?? THEME.dark;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: t.surface,
      borderColor: t.border,
    },
  ];

  const content = (
    <>
      {/* Profile: avatar, username, timestamp */}
      <View style={styles.profileRow}>
        <View style={[styles.avatar, { backgroundColor: t.border }]}>
          <Text style={[styles.avatarText, { color: t.textSecondary }]}>
            {idea.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileMeta}>
          {idea.displayName ? (
            <Text style={[styles.displayName, { color: t.text }]} numberOfLines={1}>
              {idea.displayName}
            </Text>
          ) : null}
          <Text style={[styles.username, { color: t.text }]} numberOfLines={1}>
            @{idea.username}
          </Text>
          <Text style={[styles.timestamp, { color: t.textMuted }]}>{idea.timestamp}</Text>
        </View>
      </View>

      {/* Idea title + short description */}
      <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
        {idea.title}
      </Text>
      <Text
        style={[styles.description, { color: t.textSecondary }]}
        numberOfLines={3}
      >
        {idea.description}
      </Text>

      {/* Validation metrics – primary focus */}
      <View style={[styles.metricsRow, { borderTopColor: t.border }]}>
        <View style={[styles.validationBadge, { backgroundColor: 'rgba(129, 140, 248, 0.28)' }]}>
          <Text style={[styles.validationLabel, { color: t.textMuted }]}>Validation</Text>
          <Text style={[styles.validationValue, { color: '#fff' }]}>{idea.validationScore}%</Text>
        </View>
        <View style={[styles.metricBlock, { borderColor: t.border }]}>
          <Text style={[styles.metricLabel, { color: t.textMuted }]}>Monetization</Text>
          <Text style={[styles.metricValue, { color: t.text }]}>{idea.monetization}%</Text>
        </View>
        <View style={[styles.metricBlock, { borderColor: t.border }]}>
          <Text style={[styles.metricLabel, { color: t.textMuted }]}>Difficulty</Text>
          <Text style={[styles.metricValue, { color: t.text }]}>{idea.difficulty}%</Text>
        </View>
      </View>

      {/* Upvote, Downvote, Comment count */}
      <View style={[styles.footerRow, { borderTopColor: t.border }]}>
        <Pressable
          style={({ pressed }) => [styles.footerItem, pressed && { opacity: 0.6 }]}
          onPress={() => onUpvote?.(idea.id)}
        >
          <Text style={[styles.footerIcon, { color: t.textMuted }]}>▲</Text>
          <Text style={[styles.footerCount, { color: t.textMuted }]}>{idea.upvotes}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.footerItem, pressed && { opacity: 0.6 }]}
          onPress={() => onDownvote?.(idea.id)}
        >
          <Text style={[styles.footerIcon, { color: t.textMuted }]}>▼</Text>
          <Text style={[styles.footerCount, { color: t.textMuted }]}>{idea.downvotes}</Text>
        </Pressable>
        <View style={styles.footerItem}>
          <Text style={[styles.footerIcon, { color: t.textMuted }]}>💬</Text>
          <Text style={[styles.footerCount, { color: t.textMuted }]}>{idea.comments}</Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [...cardStyle, pressed && { opacity: 0.92 }]}
        onPress={() => onPress(idea.id)}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileMeta: {
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 10,
  },
  validationBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  validationLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  validationValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricBlock: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 10,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerIcon: {
    fontSize: 12,
  },
  footerCount: {
    fontSize: 13,
  },
});
