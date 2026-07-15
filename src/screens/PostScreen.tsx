import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../store/AppContext';
import { typography, fontWeight, radius, useColors, useTheme, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { getCategoryTheme } from '../components/utils';
import { CATEGORIES, Confession } from '../types';

const MAX_CHARS = 3000;
const WARN_AT = 2700;

export default function PostScreen({ navigation }: any) {
  const styles = useThemedStyles(makePostStyles);
  const colors = useColors();
  const { mode } = useTheme();
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<string>('Love');
  const [focused, setFocused] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const bodyRef = useRef<TextInput>(null);

  const remaining = MAX_CHARS - text.length;
  const isOverLimit = text.length > MAX_CHARS;
  const isNearLimit = text.length >= WARN_AT;
  const canPost = text.trim().length > 0 && !isOverLimit;

  const progress = Math.min(text.length / MAX_CHARS, 1);
  const barColor = isOverLimit ? colors.danger : isNearLimit ? colors.warning : colors.accent;

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openLinkModal = () => {
    setLinkDraft(linkUrl ?? '');
    setLinkModal(true);
  };

  const saveLink = () => {
    const raw = linkDraft.trim();
    if (!raw) {
      setLinkUrl(null);
      setLinkModal(false);
      return;
    }
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    setLinkUrl(url);
    setLinkModal(false);
  };

  const toggleVoice = () => {
    if (hasVoiceNote) {
      setHasVoiceNote(false);
      return;
    }
    setHasVoiceNote(true);
  };

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
      imageUri,
      linkUrl,
      hasVoiceNote,
    };
    dispatch({ type: 'ADD_CONFESSION', payload: confession });
    navigation.goBack();
  };

  const catTheme = getCategoryTheme(category, mode);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused(null)}
                maxLength={120}
              />
              <TextInput
                ref={bodyRef}
                style={styles.bodyInput}
                placeholder="What's weighing on you?"
                placeholderTextColor={colors.textMeta}
                value={text}
                onChangeText={setText}
                onFocus={() => setFocused('body')}
                onBlur={() => setFocused(null)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {(imageUri || linkUrl || hasVoiceNote) && (
            <View style={styles.attachPreview}>
              {imageUri ? (
                <View style={styles.previewItem}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeChip} onPress={() => setImageUri(null)}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : null}
              {linkUrl ? (
                <View style={styles.linkChip}>
                  <Ionicons name="link" size={14} color={colors.accent} />
                  <Text style={styles.linkChipText} numberOfLines={1}>{linkUrl}</Text>
                  <TouchableOpacity onPress={() => setLinkUrl(null)}>
                    <Ionicons name="close" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {hasVoiceNote ? (
                <View style={styles.linkChip}>
                  <Ionicons name="mic" size={14} color={colors.accent} />
                  <Text style={styles.linkChipText}>Voice note attached</Text>
                  <TouchableOpacity onPress={() => setHasVoiceNote(false)}>
                    <Ionicons name="close" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: barColor }]} />
            </View>
            <Text style={[styles.charCount, isNearLimit && { color: barColor }]}>{remaining}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.chipsGrid}>
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                const t = getCategoryTheme(cat, mode);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      { borderColor: colors.border },
                      active && { backgroundColor: t.bg, borderColor: t.dot },
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

          <View style={styles.attachBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color={imageUri ? colors.accent : colors.textSecondary} />
              <Text style={[styles.attachText, !!imageUri && { color: colors.accent }]}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn} onPress={toggleVoice}>
              <Ionicons name="mic-outline" size={20} color={hasVoiceNote ? colors.accent : colors.textSecondary} />
              <Text style={[styles.attachText, hasVoiceNote && { color: colors.accent }]}>Voice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn} onPress={openLinkModal}>
              <Ionicons name="link-outline" size={20} color={linkUrl ? colors.accent : colors.textSecondary} />
              <Text style={[styles.attachText, !!linkUrl && { color: colors.accent }]}>Link</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.anonNotice}>
            <Ionicons name="shield-checkmark-outline" size={15} color={colors.success} />
            <Text style={styles.anonText}>Posted anonymously. Your identity is never revealed.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={linkModal} transparent animationType="fade" onRequestClose={() => setLinkModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add a link</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://example.com"
              placeholderTextColor={colors.textMeta}
              value={linkDraft}
              onChangeText={setLinkDraft}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setLinkModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveLink}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}



function makePostStyles(colors: ColorPalette) {
  return {
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
  attachPreview: { gap: 10 },
  previewItem: { position: 'relative', alignSelf: 'flex-start' },
  previewImage: { width: 120, height: 120, borderRadius: radius.md },
  removeChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  linkChipText: { flex: 1, color: colors.textSecondary, fontSize: typography.xs },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: typography.base,
  },
  modalInput: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: typography.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  modalCancel: { color: colors.textSecondary, fontSize: typography.sm },
  modalSave: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  modalSaveText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.sm },
};
}
