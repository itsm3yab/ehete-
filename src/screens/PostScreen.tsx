import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { colors, typography, fontWeight, radius, categoryTheme } from '../store/theme';
import { CATEGORIES, Confession } from '../types';

const MAX_CHARS = 3000;
const WARN_AT = 2700;

export default function PostScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<string>('Love');
  const [focused, setFocused] = useState<string | null>(null);
  const bodyRef = useRef<TextInput>(null);

  const remaining = MAX_CHARS - text.length;
  const isOverLimit = text.length > MAX_CHARS;
  const isNearLimit = text.length >= WARN_AT;
  const canPost = text.trim().length > 0 && !isOverLimit;

  // Animated progress bar
  const progress = Math.min(text.length / MAX_CHARS, 1);
  const barColor = isOverLimit ? colors.danger : isNearLimit ? colors.warning : colors.accent;

  const handleSubmit = () => {
    if (!text.trim()) {
      Alert.alert('Empty confession', 'Write something before posting.');
      return;
    }
    if (isOverLimit) {
      Alert.alert('Too long', `Keep it under ${MAX_CHARS} characters.`);
      return;
    }
    const confession: Confession = {
      id: String(Date.now()),
      title: title.trim(),
      text: text.trim(),
      category,
      upvotes: 0,
      downvotes: 0,
      replyCount: 0,
      timestamp: Date.now(),
      authorId: state.username,
    };
    dispatch({ type: 'ADD_CONFESSION', payload: confession });
    navigation.goBack();
  };

  const catTheme = categoryTheme[category] ?? { bg: colors.accentDim, text: colors.accent };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={[styles.catPill, { backgroundColor: catTheme.bg }]}>
              <Text style={[styles.catPillText, { color: catTheme.text }]}>{category}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.postBtn,
              !canPost && styles.postBtnDisabled,
              pressed && canPost && { opacity: 0.85 },
            ]}
            onPress={handleSubmit}
            disabled={!canPost}
            accessibilityRole="button"
            accessibilityLabel="Post confession"
          >
            <Text style={[styles.postBtnText, !canPost && styles.postBtnTextDisabled]}>Post</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + inputs */}
          <View style={styles.composeRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {(state.username || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.inputs}>
              <TextInput
                style={[styles.titleInput, focused === 'title' && styles.titleInputFocused]}
                placeholder="Add a title... (optional)"
                placeholderTextColor={colors.textMeta}
                value={title}
                onChangeText={setTitle}
                maxLength={120}
                returnKeyType="next"
                onSubmitEditing={() => bodyRef.current?.focus()}
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused(null)}
              />
              <TextInput
                ref={bodyRef}
                style={styles.bodyInput}
                placeholder="What's on your mind? This is a safe, anonymous space."
                placeholderTextColor={colors.textMeta}
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
                autoFocus
                onFocus={() => setFocused('body')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Char progress */}
          {text.length > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: barColor }]} />
              </View>
              <Text style={[styles.charCount, (isOverLimit || isNearLimit) && { color: barColor }]}>
                {isOverLimit ? `${Math.abs(remaining)} over` : remaining}
              </Text>
            </View>
          )}

          {/* Category picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.chipsGrid}>
              {CATEGORIES.map((cat) => {
                const t = categoryTheme[cat] ?? { bg: colors.bgElevated, text: colors.textSecondary, dot: colors.accent };
                const active = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      active
                        ? { backgroundColor: t.bg, borderColor: t.dot }
                        : { backgroundColor: colors.bgCard, borderColor: colors.border },
                    ]}
                    onPress={() => setCategory(cat)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={cat}
                  >
                    {active && <View style={[styles.chipDot, { backgroundColor: t.dot }]} />}
                    <Text style={[styles.chipText, active && { color: t.text, fontWeight: fontWeight.semibold }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Attachment bar */}
          <View style={styles.attachBar}>
            {[
              { icon: 'image-outline', label: 'Image' },
              { icon: 'mic-outline', label: 'Voice' },
              { icon: 'link-outline', label: 'Link' },
            ].map(({ icon, label }) => (
              <TouchableOpacity
                key={label}
                style={styles.attachBtn}
                onPress={() => Alert.alert('Coming Soon', `${label} attachment coming soon!`)}
              >
                <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
                <Text style={styles.attachText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Anonymous notice */}
          <View style={styles.anonNotice}>
            <Ionicons name="shield-checkmark-outline" size={15} color={colors.success} />
            <Text style={styles.anonText}>Posted anonymously. Your identity is never revealed.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  catPillText: { fontSize: typography.xs, fontWeight: fontWeight.semibold },
  postBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  postBtnDisabled: { backgroundColor: colors.bgElevated },
  postBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.sm },
  postBtnTextDisabled: { color: colors.textMeta },
  scroll: { padding: 16, gap: 20 },
  composeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  authorAvatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.base },
  inputs: { flex: 1, gap: 10 },
  titleInput: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 8,
  },
  titleInputFocused: { borderBottomColor: colors.accent },
  bodyInput: {
    color: colors.textPrimary,
    fontSize: typography.base,
    lineHeight: 24,
    minHeight: 140,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  charCount: {
    color: colors.textMeta,
    fontSize: typography.xs,
    fontWeight: fontWeight.medium,
    minWidth: 32,
    textAlign: 'right',
  },
  section: { gap: 10 },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { color: colors.textSecondary, fontSize: typography.xs },
  attachBar: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
  attachText: { color: colors.textSecondary, fontSize: typography.xs, fontWeight: fontWeight.medium },
  anonNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.successDim,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  anonText: { color: colors.success, fontSize: typography.xs, flex: 1, lineHeight: 18 },
});
