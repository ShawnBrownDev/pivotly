import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeonInput } from '@/components/NeonInput';
import { NeonButton } from '@/components/NeonButton';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/lib/auth-context';
import { createIdea } from '@/lib/api-client';

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;

export function PostIdeaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: { title?: string; description?: string } = {};
    const tTrim = title.trim();
    const dTrim = description.trim();
    if (!tTrim) next.title = 'Title is required';
    else if (tTrim.length > TITLE_MAX) next.title = `Title must be ${TITLE_MAX} characters or less`;
    if (!dTrim) next.description = 'Description is required';
    else if (dTrim.length > DESCRIPTION_MAX)
      next.description = `Description must be ${DESCRIPTION_MAX} characters or less`;
    setErrors(next);
    setApiError(null);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user?.id) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const result = await createIdea(title.trim(), description.trim());
      if (result.ok) {
        router.replace(('/(tabs)') as import('expo-router').Href);
        return;
      }
      setApiError(result.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    router.replace(('/main') as import('expo-router').Href);
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 24 + insets.top }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: t.text }]}>Post an idea</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Share your startup idea with the community.
        </Text>
        <NeonInput
          label="Title"
          placeholder="e.g. AI-powered meal planner"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          maxLength={TITLE_MAX + 1}
          editable={!submitting}
        />
        <View style={styles.descriptionWrap}>
          <Text style={[styles.label, { color: t.textSecondary }]}>Description</Text>
          <TextInput
            placeholder="What's the idea? Who is it for? What problem does it solve?"
            placeholderTextColor={t.textMuted}
            value={description}
            onChangeText={setDescription}
            editable={!submitting}
            multiline
            numberOfLines={4}
            maxLength={DESCRIPTION_MAX + 1}
            style={[
              styles.descriptionInput,
              {
                backgroundColor: t.inputBg,
                borderColor: errors.description ? t.error : t.border,
                color: t.text,
              },
            ]}
          />
          {errors.description ? (
            <Text style={[styles.error, { color: t.error }]}>{errors.description}</Text>
          ) : null}
          <Text style={[styles.charCount, { color: t.textMuted }]}>
            {description.length} / {DESCRIPTION_MAX}
          </Text>
        </View>
        {apiError ? (
          <View style={[styles.errorBanner, { backgroundColor: t.surface, borderColor: t.error }]}>
            <Text style={[styles.errorText, { color: t.error }]}>{apiError}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <NeonButton
            title={submitting ? 'Posting…' : 'Post idea'}
            variant="primary"
            fullWidth
            onPress={handleSubmit}
            disabled={submitting}
            style={styles.primaryBtn}
          />
          {submitting ? (
            <ActivityIndicator size="small" color={t.accent} style={styles.loader} />
          ) : null}
          <NeonButton
            title="Cancel"
            variant="ghost"
            fullWidth
            onPress={() => router.back()}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  descriptionWrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  descriptionInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  error: { fontSize: 12, marginTop: 4 },
  charCount: { fontSize: 12, marginTop: 4 },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { fontSize: 14 },
  actions: { marginTop: 8, gap: 12 },
  primaryBtn: { marginTop: 8 },
  loader: { marginVertical: 8 },
});
