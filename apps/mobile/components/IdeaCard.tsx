import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { THEME } from '@/constants/theme';

export type IdeaCardData = {
  id: string;
  title: string;
  description: string;
  validationScore: number;
  monetization: number;
  difficulty: number;
  upvotes: number;
  downvotes: number;
};

type IdeaCardProps = {
  idea: IdeaCardData;
  onUpvote?: (id: string) => void;
  onDownvote?: (id: string) => void;
};

function Bar({ value, label, color }: { value: number; label: string; color: string }) {
  const t = THEME.dark;
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: t.textMuted }]}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: t.surface }]}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.barValue, { color: t.textSecondary }]}>{value}%</Text>
    </View>
  );
}

export function IdeaCard({ idea, onUpvote, onDownvote }: IdeaCardProps) {
  const t = THEME.dark;

  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <Text style={[styles.title, { color: t.text }]}>{idea.title}</Text>
      <Text style={[styles.description, { color: t.textSecondary }]} numberOfLines={2}>
        {idea.description}
      </Text>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreLabel, { color: t.textMuted }]}>Validation</Text>
        <View style={[styles.scoreBadge, { borderColor: t.neon }]}>
          <Text style={[styles.scoreValue, { color: t.neon }]}>{idea.validationScore}%</Text>
        </View>
      </View>
      <Bar value={idea.monetization} label="Monetization" color={t.neon} />
      <Bar value={idea.difficulty} label="Difficulty" color={t.neonMuted} />
      <View style={styles.voteRow}>
        <Pressable
          style={({ pressed }) => [
            styles.voteButton,
            { borderColor: t.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => onUpvote?.(idea.id)}
        >
          <Text style={[styles.voteText, { color: t.textSecondary }]}>▲ {idea.upvotes}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.voteButton,
            { borderColor: t.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => onDownvote?.(idea.id)}
        >
          <Text style={[styles.voteText, { color: t.textSecondary }]}>▼ {idea.downvotes}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  scoreLabel: {
    fontSize: 12,
  },
  scoreBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  barLabel: {
    fontSize: 12,
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barValue: {
    fontSize: 12,
    width: 32,
    textAlign: 'right',
  },
  voteRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 12,
  },
  voteButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  voteText: {
    fontSize: 14,
  },
});
