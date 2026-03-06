import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PLACEHOLDER_IDEAS } from '@/data/placeholder-ideas';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/lib/auth-context';
import { getComments, createComment, getIdea } from '@/lib/api-client';
import type { IdeaCardData } from '@/components/IdeaCard';
import type { CommentDto } from '@pivotly/types';

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

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const { user } = useAuth();
  const [idea, setIdea] = useState<IdeaCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentList, setCommentList] = useState<CommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const placeholder = PLACEHOLDER_IDEAS.find((i) => i.id === id);
    if (placeholder) {
      setIdea(placeholder);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await getIdea(id);
      if (cancelled) return;
      setLoading(false);
      if (result.ok) {
        const dto = result.idea;
        setIdea({
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
        });
      } else {
        setNotFound(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !idea) return;
    let cancelled = false;
    setCommentsLoading(true);
    (async () => {
      const result = await getComments(id);
      if (cancelled) return;
      setCommentsLoading(false);
      if (result.ok) {
        setCommentList(result.comments);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, idea]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: t.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => pressed && { opacity: 0.7 }}>
            <Text style={[styles.backText, { color: t.accent }]}>← Back</Text>
          </Pressable>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (notFound || !idea) {
    return (
      <View style={[styles.container, { backgroundColor: t.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => pressed && { opacity: 0.7 }}>
            <Text style={[styles.backText, { color: t.accent }]}>← Back</Text>
          </Pressable>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: t.textSecondary }]}>Idea not found</Text>
        </View>
      </View>
    );
  }

  const handleSubmitComment = async () => {
    if (!id || !user?.id || !commentInput.trim()) return;
    setCommentSubmitting(true);
    const result = await createComment(id, commentInput.trim());
    setCommentSubmitting(false);
    if (result.ok) {
      setCommentList((prev) => [result.comment, ...prev]);
      setCommentInput('');
      setIdea((prev) =>
        prev ? { ...prev, comments: prev.comments + 1 } : null
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <Text style={[styles.backText, { color: t.accent }]}>← Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile header – idea author */}
        <View style={[styles.profileHeader, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: t.border }]}>
            <Text style={[styles.profileAvatarText, { color: t.textSecondary }]}>
              {idea.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            {idea.displayName ? (
              <Text style={[styles.profileDisplayName, { color: t.text }]} numberOfLines={1}>
                {idea.displayName}
              </Text>
            ) : null}
            <Text style={[styles.profileName, { color: t.text }]}>@{idea.username}</Text>
            <Text style={[styles.profileTimestamp, { color: t.textMuted }]}>
              Posted {idea.timestamp}
            </Text>
          </View>
        </View>

        {/* Full idea details */}
        <Text style={[styles.title, { color: t.text }]}>{idea.title}</Text>
        <Text style={[styles.description, { color: t.textSecondary }]}>{idea.description}</Text>

        {/* Validation metrics – clearly displayed, primary */}
        <View style={styles.metricsSection}>
          <Text style={[styles.sectionLabel, { color: t.textMuted }]}>Validation metrics</Text>
          <View style={[styles.metricsCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={[styles.validationBlock, { backgroundColor: 'rgba(129, 140, 248, 0.28)' }]}>
              <Text style={[styles.validationLabel, { color: t.textMuted }]}>Validation score</Text>
              <Text style={[styles.validationValue, { color: '#fff' }]}>{idea.validationScore}%</Text>
            </View>
            <View style={[styles.metricRow, { borderColor: t.border }]}>
              <Text style={[styles.metricLabel, { color: t.textMuted }]}>Monetization</Text>
              <Text style={[styles.metricValue, { color: t.text }]}>{idea.monetization}%</Text>
            </View>
            <View style={[styles.metricRow, { borderColor: t.border }]}>
              <Text style={[styles.metricLabel, { color: t.textMuted }]}>Difficulty</Text>
              <Text style={[styles.metricValue, { color: t.text }]}>{idea.difficulty}%</Text>
            </View>
          </View>
        </View>

        {/* Upvote + Downvote + Comment count */}
        <View style={[styles.engagementRow, { borderColor: t.border }]}>
          <Pressable
            style={({ pressed }) => [styles.engagementBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.engagementIcon, { color: t.textMuted }]}>▲</Text>
            <Text style={[styles.engagementCount, { color: t.textMuted }]}>{idea.upvotes}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.engagementBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.engagementIcon, { color: t.textMuted }]}>▼</Text>
            <Text style={[styles.engagementCount, { color: t.textMuted }]}>{idea.downvotes}</Text>
          </Pressable>
          <View style={styles.engagementBtn}>
            <Text style={[styles.engagementIcon, { color: t.textMuted }]}>💬</Text>
            <Text style={[styles.engagementCount, { color: t.textMuted }]}>{idea.comments}</Text>
          </View>
        </View>

        {/* Comment list + input */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsSectionTitle, { color: t.textMuted }]}>Comments</Text>
          {commentsLoading ? (
            <ActivityIndicator size="small" color={t.accent} style={styles.commentsLoading} />
          ) : commentList.length === 0 ? (
            <Text style={[styles.noComments, { color: t.textMuted }]}>No comments yet. Be the first.</Text>
          ) : (
            commentList.map((c) => (
              <View
                key={c.id}
                style={[styles.commentCard, { backgroundColor: t.surface, borderColor: t.border }]}
              >
                <Text style={[styles.commentAuthor, { color: t.text }]}>@{c.username}</Text>
                <Text style={[styles.commentBody, { color: t.textSecondary }]}>{c.body}</Text>
                <Text style={[styles.commentTime, { color: t.textMuted }]}>
                  {formatRelativeTime(c.created_at)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Comment input */}
        <View style={[styles.inputWrap, { borderColor: t.border, backgroundColor: t.surface }]}>
          <TextInput
            style={[styles.input, { color: t.text }]}
            placeholder="Add a comment..."
            placeholderTextColor={t.textMuted}
            value={commentInput}
            onChangeText={setCommentInput}
            editable={!commentSubmitting}
            onSubmitEditing={handleSubmitComment}
          />
          <Pressable
            onPress={handleSubmitComment}
            disabled={commentSubmitting || !commentInput.trim()}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: t.accent },
              pressed && { opacity: 0.85 },
              (commentSubmitting || !commentInput.trim()) && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.submitBtnText}>
              {commentSubmitting ? 'Posting…' : 'Post'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileMeta: {
    flex: 1,
  },
  profileDisplayName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileTimestamp: {
    fontSize: 13,
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  metricsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  metricsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  validationBlock: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  validationLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  validationValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  metricLabel: {
    fontSize: 15,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: 24,
  },
  engagementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementIcon: {
    fontSize: 16,
  },
  engagementCount: {
    fontSize: 15,
  },
  commentsSection: {
    marginTop: 24,
  },
  commentsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  commentsLoading: {
    marginVertical: 12,
  },
  noComments: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  commentCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  commentBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  commentTime: {
    fontSize: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
});
