import React, { useCallback, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../store/AppContext';
import { typography, fontWeight, radius, useColors, useTheme, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { getCategoryTheme } from '../components/utils';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';
import { CATEGORIES, Confession } from '../types';

const StyleSheetHairline = Platform.OS === 'android' ? 1 : 0.5;

const MAX_CHARS = 3000;
const REDDIT_ORANGE = '#FF4500';
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const SELF_DESTRUCT_OPTIONS: { label: string; ms: number | null }[] = [
  { label: 'Off', ms: null },
  { label: '1 hour', ms: HOUR },
  { label: '6 hours', ms: 6 * HOUR },
  { label: '24 hours', ms: DAY },
  { label: '3 days', ms: 3 * DAY },
  { label: '7 days', ms: 7 * DAY },
];

type PostType = 'text' | 'image';

export default function PostScreen({ navigation }: any) {
  const styles = useThemedStyles(makePostStyles);
  const colors = useColors();
  const { mode } = useTheme();
  const { state, dispatch } = useApp();
  const { hideTabBar, showTabBar } = useTabBarScroll();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<string>('Love/Cheating');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selfDestructMs, setSelfDestructMs] = useState<number | null>(null);
  const [postType, setPostType] = useState<PostType>('text');
  const [communityOpen, setCommunityOpen] = useState(false);
  const [destructOpen, setDestructOpen] = useState(false);
  const bodyRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
      return () => showTabBar();
    }, [hideTabBar, showTabBar])
  );

  const isOverLimit = text.length > MAX_CHARS;
  const hasTitle = title.trim().length > 0;
  const hasContent =
    postType === 'image' ? !!imageUri || text.trim().length > 0 : text.trim().length > 0 || !!imageUri;
  const canPost = hasTitle && hasContent && !isOverLimit && !!category;

  const catTheme = getCategoryTheme(category, mode);
  const destructLabel =
    SELF_DESTRUCT_OPTIONS.find((o) => o.ms === selfDestructMs)?.label ?? 'Off';

  const applyPickedAsset = (uri?: string) => {
    if (uri) {
      setImageUri(uri);
      setPostType('image');
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
      exif: false,
    });
    if (!result.canceled) applyPickedAsset(result.assets[0]?.uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
      exif: false,
    });
    if (!result.canceled) applyPickedAsset(result.assets[0]?.uri);
  };

  const openImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Photo library', 'Take photo', ...(imageUri ? ['Remove'] : [])],
          cancelButtonIndex: 0,
          destructiveButtonIndex: imageUri ? 3 : undefined,
        },
        (i) => {
          if (i === 1) pickFromLibrary();
          else if (i === 2) takePhoto();
          else if (i === 3) setImageUri(null);
        }
      );
      return;
    }
    Alert.alert('Add image', undefined, [
      { text: 'Library', onPress: pickFromLibrary },
      { text: 'Camera', onPress: takePhoto },
      ...(imageUri
        ? [{ text: 'Remove', style: 'destructive' as const, onPress: () => setImageUri(null) }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Titles help sisters find your confession.');
      return;
    }
    if (!hasContent) {
      Alert.alert('Empty post', 'Add text or an image before posting.');
      return;
    }
    if (isOverLimit) {
      Alert.alert('Too long', `Keep it under ${MAX_CHARS} characters.`);
      return;
    }
    const now = Date.now();
    dispatch({
      type: 'ADD_CONFESSION',
      payload: {
        id: String(now),
        title: title.trim(),
        text: text.trim(),
        category,
        upvotes: 0,
        downvotes: 0,
        replyCount: 0,
        timestamp: now,
        authorId: state.username,
        imageUri: postType === 'image' || imageUri ? imageUri : null,
        expiresAt: selfDestructMs != null ? now + selfDestructMs : null,
      } as Confession,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Reddit-style top bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New post</Text>
          <Pressable
            style={({ pressed }) => [
              styles.postBtn,
              !canPost && styles.postBtnDisabled,
              pressed && canPost && { opacity: 0.85 },
            ]}
            onPress={handleSubmit}
            disabled={!canPost}
          >
            <Text style={[styles.postBtnText, !canPost && styles.postBtnTextDisabled]}>Post</Text>
          </Pressable>
        </View>

        {/* Community selector — Reddit r/ style */}
        <TouchableOpacity
          style={styles.communityRow}
          onPress={() => setCommunityOpen(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.communityAvatar, { backgroundColor: catTheme.dot }]}>
            <Text style={styles.communityAvatarText}>{category.charAt(0)}</Text>
          </View>
          <View style={styles.communityMeta}>
            <Text style={styles.communityLabel}>Select a community</Text>
            <Text style={styles.communityName} numberOfLines={1}>
              r/{category.replace(/\s+/g, '')}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Post type tabs — Reddit style */}
        <View style={styles.typeTabs}>
          {(
            [
              { id: 'text' as const, label: 'Post', icon: 'document-text-outline' },
              { id: 'image' as const, label: 'Image', icon: 'image-outline' },
            ] as const
          ).map((t) => {
            const active = postType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeTab, active && styles.typeTabActive]}
                onPress={() => {
                  setPostType(t.id);
                  if (t.id === 'image' && !imageUri) openImagePicker();
                }}
              >
                <Ionicons
                  name={t.icon}
                  size={16}
                  color={active ? REDDIT_ORANGE : colors.textSecondary}
                />
                <Text style={[styles.typeTabText, active && styles.typeTabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={colors.textMeta}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
          <View style={styles.titleRule} />

          {postType === 'image' && (
            <View style={styles.imageBlock}>
              {imageUri ? (
                <View style={styles.imageWrap}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeChip} onPress={() => setImageUri(null)}>
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imageEmpty} onPress={openImagePicker}>
                  <Ionicons name="image-outline" size={36} color={colors.textMeta} />
                  <Text style={styles.imageEmptyText}>Tap to add an image</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TextInput
            ref={bodyRef}
            style={styles.bodyInput}
            placeholder="body text (optional)"
            placeholderTextColor={colors.textMeta}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.optionRow} onPress={() => setDestructOpen(true)}>
            <Ionicons name="timer-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.optionLabel}>Self-destruct</Text>
            <Text style={styles.optionValue}>{destructLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMeta} />
          </TouchableOpacity>
        </ScrollView>

        {/* Reddit bottom toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolBtn} onPress={openImagePicker}>
            <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => bodyRef.current?.focus()}>
            <Ionicons name="text-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => setCommunityOpen(true)}>
            <Ionicons name="people-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <Text style={[styles.charHint, isOverLimit && { color: colors.danger }]}>
            {MAX_CHARS - text.length}
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Community picker */}
      <Modal visible={communityOpen} animationType="slide" onRequestClose={() => setCommunityOpen(false)}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={() => setCommunityOpen(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Select a community</Text>
            <View style={{ width: 24 }} />
          </View>
          <FlatList
            data={[...CATEGORIES]}
            keyExtractor={(c) => c}
            contentContainerStyle={{ padding: 12, gap: 4 }}
            renderItem={({ item }) => {
              const t = getCategoryTheme(item, mode);
              const active = category === item;
              return (
                <TouchableOpacity
                  style={[styles.communityItem, active && styles.communityItemActive]}
                  onPress={() => {
                    setCategory(item);
                    setCommunityOpen(false);
                  }}
                >
                  <View style={[styles.communityAvatar, { backgroundColor: t.dot }]}>
                    <Text style={styles.communityAvatarText}>{item.charAt(0)}</Text>
                  </View>
                  <Text style={styles.communityItemName}>r/{item.replace(/\s+/g, '')}</Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color={REDDIT_ORANGE} />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Self-destruct picker */}
      <Modal visible={destructOpen} transparent animationType="fade" onRequestClose={() => setDestructOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setDestructOpen(false)}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetCardTitle}>Self-destruct</Text>
            {SELF_DESTRUCT_OPTIONS.map((opt) => {
              const active = selfDestructMs === opt.ms;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.sheetOption}
                  onPress={() => {
                    setSelfDestructMs(opt.ms);
                    setDestructOpen(false);
                  }}
                >
                  <Text style={[styles.sheetOptionText, active && { color: REDDIT_ORANGE }]}>
                    {opt.label}
                  </Text>
                  {active && <Ionicons name="checkmark" size={18} color={REDDIT_ORANGE} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function makePostStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.base,
      fontWeight: fontWeight.bold,
    },
    postBtn: {
      backgroundColor: REDDIT_ORANGE,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: radius.full,
      minWidth: 64,
      alignItems: 'center' as const,
    },
    postBtnDisabled: { backgroundColor: colors.bgElevated },
    postBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.sm },
    postBtnTextDisabled: { color: colors.textMeta },
    communityRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    communityAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    communityAvatarText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
    communityMeta: { flex: 1 },
    communityLabel: {
      color: colors.textMeta,
      fontSize: 11,
    },
    communityName: {
      color: colors.textPrimary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.sm,
      marginTop: 1,
    },
    typeTabs: {
      flexDirection: 'row' as const,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    typeTab: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 6,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    typeTabActive: { borderBottomColor: REDDIT_ORANGE },
    typeTabText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    typeTabTextActive: { color: REDDIT_ORANGE, fontWeight: fontWeight.bold },
    scroll: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },
    titleInput: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: fontWeight.bold,
      paddingVertical: 12,
    },
    titleRule: {
      height: StyleSheetHairline,
      backgroundColor: colors.border,
      marginBottom: 8,
    },
    bodyInput: {
      color: colors.textPrimary,
      fontSize: typography.base,
      lineHeight: 22,
      minHeight: 140,
      paddingVertical: 8,
    },
    imageBlock: { marginBottom: 12 },
    imageWrap: {
      position: 'relative' as const,
      borderRadius: radius.md,
      overflow: 'hidden' as const,
    },
    previewImage: {
      width: '100%' as const,
      height: 220,
      backgroundColor: colors.bgElevated,
    },
    removeChip: {
      position: 'absolute' as const,
      top: 10,
      right: 10,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    imageEmpty: {
      height: 160,
      borderRadius: radius.md,
      borderWidth: 1,
      borderStyle: 'dashed' as const,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    imageEmptyText: { color: colors.textMeta, fontSize: typography.sm },
    optionRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      backgroundColor: colors.bgElevated,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    optionLabel: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    optionValue: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      marginRight: 2,
    },
    toolbar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
      backgroundColor: colors.bg,
    },
    toolBtn: {
      width: 40,
      height: 40,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 20,
    },
    charHint: {
      color: colors.textMeta,
      fontSize: typography.xs,
      paddingHorizontal: 8,
    },
    sheetHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    sheetTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    communityItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: radius.md,
    },
    communityItemActive: { backgroundColor: colors.bgElevated },
    communityItemName: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.sm,
      fontWeight: fontWeight.semibold,
    },
    sheetBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end' as const,
    },
    sheetCard: {
      backgroundColor: colors.bgElevated,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      padding: 16,
      paddingBottom: 28,
      gap: 2,
    },
    sheetCardTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
      marginBottom: 8,
    },
    sheetOption: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: 14,
    },
    sheetOptionText: {
      color: colors.textPrimary,
      fontSize: typography.sm,
    },
  };
}
