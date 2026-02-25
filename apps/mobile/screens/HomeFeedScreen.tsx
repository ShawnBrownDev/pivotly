import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IdeaCard } from '@/components/IdeaCard';
import { NeonButton } from '@/components/NeonButton';
import { PLACEHOLDER_IDEAS } from '@/data/placeholder-ideas';
import type { IdeaCardData } from '@/components/IdeaCard';
import { THEME } from '@/constants/theme';

export function HomeFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ideas, setIdeas] = useState<IdeaCardData[]>(PLACEHOLDER_IDEAS);
  const t = THEME.dark;

  const handleUpvote = (id: string) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i
      )
    );
  };

  const handleDownvote = (id: string) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, downvotes: i.downvotes + 1 } : i
      )
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={[styles.header, { paddingTop: 24 + insets.top }]}>
        <Text style={[styles.title, { color: t.text }]}>Idea Feed</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Explore and validate startup ideas
        </Text>
        <NeonButton
          title="Back to Main"
          variant="ghost"
          onPress={() => router.replace(('/main') as import('expo-router').Href)}
          style={styles.backBtn}
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
