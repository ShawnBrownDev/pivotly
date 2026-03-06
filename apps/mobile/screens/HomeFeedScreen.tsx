import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { IdeaCard } from '@/components/IdeaCard';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { IdeaCardData } from '@/components/IdeaCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/lib/auth-context';
import { getIdeas } from '@/lib/api-client';
import type { IdeaDto } from '@pivotly/types';

type SortOption = 'trending' | 'new' | 'top';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ideaDtoToCard(dto: IdeaDto): IdeaCardData {
  return {
    id: dto.id,
    username: dto.username,
    displayName: dto.author_display_name ?? undefined,
    timestamp: formatRelativeTime(dto.created_at),
    title: dto.title,
    description: dto.description,
    validationScore: dto.validation_score,
    monetization: dto.monetization,
    difficulty: dto.difficulty,
    upvotes: dto.upvotes,
    downvotes: dto.downvotes,
    comments: dto.comments,
  };
}

export function HomeFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<IdeaCardData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('trending');

  const loadIdeas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(null);
    const result = await getIdeas();
    setLoading(false);
    if (result.ok) {
      setIdeas(result.ideas.map(ideaDtoToCard));
    } else {
      setFetchError(result.error);
      setIdeas([]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadIdeas();
    }, [user, loadIdeas])
  );

  React.useEffect(() => {
    if (!user) {
      router.replace(('/main') as import('expo-router').Href);
      return;
    }
  }, [user, router]);

  const handleUpvote = (id: string) => {
    setIdeas((prev) =>
      prev ? prev.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i)) : []
    );
  };

  const handleDownvote = (id: string) => {
    setIdeas((prev) =>
      prev ? prev.map((i) => (i.id === id ? { ...i, downvotes: i.downvotes + 1 } : i)) : []
    );
  };

  const isEmpty = !loading && (!ideas || ideas.length === 0);

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.appName, { color: t.text }]}>Pivotly</Text>
        </View>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Explore and validate startup ideas
        </Text>
        <View style={styles.segmentedWrap}>
          <SegmentedControl
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        </View>
      </View>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading ideas…</Text>
        </View>
      ) : isEmpty ? (
        <EmptyState
          title="No ideas yet"
          subtitle={
            fetchError
              ? fetchError
              : 'Use the Post tab to share an idea, or check back later for new ideas.'
          }
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {ideas!.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onPress={(id) => router.push(`/idea/${id}` as import('expo-router').Href)}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              theme={t}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  segmentedWrap: {
    marginBottom: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
});
