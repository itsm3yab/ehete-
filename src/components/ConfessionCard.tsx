import React, { useCallback, memo } from 'react';
import {
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Confession } from '../types';
import { useColors, useTheme, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { getCategoryTheme, formatCount, categoryInitial, timeAgo, estimatedViews, timeLeft } from './utils';
import { useApp } from '../store/AppContext';
import { useAuthGate } from './AuthGate';
import { hapticLight, hapticSelect, hapticSuccess } from '../utils/haptics';

interface Props {
  confession: Confession;
  onPress: () => void;
  showDelete?: boolean;
}

function ConfessionCard({ confession, onPress, showDelete = false }: Props) {
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();
  const colors = useColors();
  const { mode } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isLight = mode === 'light';
  const surface = isLight ? '#ffffff' : colors.bgCard;

  const isUpvoted = state.upvotedIds.has(confession.id);
  const isDownvoted = state.downvotedIds.has(confession.id);
  const isSaved = state.savedIds.has(confession.id);

  const netVotes = confession.upvotes - confession.downvotes;
  const views = estimatedViews(confession.upvotes, confession.downvotes, confession.replyCount);
  const theme = getCategoryTheme(confession.category, mode);
  const authorLabel = confession.authorId ? `@${confession.authorId}` : 'anonymous';

  const handleOpen = () => {
    if (!requireAuth('Sign in to open posts and join the conversation.')) return;
    hapticSelect();
    onPress();
  };

  const handleShare = useCallback(async () => {
    hapticLight();
    await Share.share({
      message: `[${confession.category}] ${confession.text}\n\nShared from እህቴ`,
    });
  }, [confession]);

  const toggleSave = useCallback(() => {
    if (!requireAuth('Sign in to save confessions.')) return;
    hapticSuccess();
    dispatch({ type: 'TOGGLE_SAVE', payload: confession.id });
  }, [requireAuth, dispatch, confession.id]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Confession', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'DELETE_CONFESSION', payload: confession.id }),
      },
    ]);
  }, [confession.id, dispatch]);

  const voteColor = isUpvoted ? colors.upvote : isDownvoted ? colors.downvote : colors.voteDefault;

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: surface,
          borderBottomColor: isLight ? '#f0f0f0' : colors.border,
        },
        pressed && { opacity: 0.96 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${confession.category} confession: ${confession.title || confession.text.slice(0, 60)}`}
    >
      <View style={[styles.avatar, { backgroundColor: theme.dot }]}>
        <Text style={styles.avatarText}>{categoryInitial(confession.category)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.categoryBadge,
              { borderColor: theme.dot + '66', backgroundColor: surface },
            ]}
          >
            <Text style={[styles.categoryText, { color: theme.text }]}>{confession.category}</Text>
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {authorLabel} · {timeAgo(confession.timestamp)}
          </Text>
          {showDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Delete confession"
            >
              <Ionicons name="trash-outline" size={15} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        {confession.title.length > 0 && (
          <Text style={styles.title} numberOfLines={2}>
            {confession.title}
          </Text>
        )}

        {confession.text.length > 0 && (
          <Text style={styles.text} numberOfLines={6}>
            {confession.text}
          </Text>
        )}

        {!!confession.imageUri && (
          <Image
            source={{ uri: confession.imageUri }}
            style={[styles.postImage, { backgroundColor: surface }]}
            resizeMode="cover"
            accessibilityLabel="Confession image"
          />
        )}

        {typeof confession.expiresAt === 'number' && (
          <View style={styles.destructRow}>
            <Ionicons name="timer-outline" size={13} color={colors.danger} />
            <Text style={styles.destructText}>{timeLeft(confession.expiresAt)}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              if (!requireAuth('Sign in to like confessions.')) return;
              hapticSelect();
              dispatch({ type: 'TOGGLE_UPVOTE', payload: confession.id });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            accessibilityLabel={isUpvoted ? 'Remove upvote' : 'Upvote'}
          >
            <Ionicons
              name={isUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={22}
              color={isUpvoted ? colors.upvote : colors.voteDefault}
            />
            <Text style={[styles.actionCount, { color: voteColor }]}>
              {formatCount(netVotes)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              if (!requireAuth('Sign in to vote on confessions.')) return;
              hapticSelect();
              dispatch({ type: 'TOGGLE_DOWNVOTE', payload: confession.id });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            accessibilityLabel={isDownvoted ? 'Remove downvote' : 'Downvote'}
          >
            <Ionicons
              name={isDownvoted ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
              size={22}
              color={isDownvoted ? colors.downvote : colors.voteDefault}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleOpen}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            accessibilityLabel={`${confession.replyCount} replies`}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.voteDefault} />
            <Text style={styles.actionCount}>{formatCount(confession.replyCount)}</Text>
          </TouchableOpacity>

          <View style={styles.actionBtn}>
            <Ionicons name="eye-outline" size={20} color={colors.voteDefault} />
            <Text style={styles.actionCount}>{formatCount(views)}</Text>
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={toggleSave}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityLabel={isSaved ? 'Unsave' : 'Save'}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? colors.accent : colors.voteDefault}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityLabel="Share"
            >
              <Ionicons name="share-outline" size={20} color={colors.voteDefault} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ConfessionCard);

function createStyles(colors: ColorPalette) {
  return {
    card: {
      flexDirection: 'row' as const,
      marginHorizontal: 0,
      marginBottom: 0,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 0,
      borderWidth: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexShrink: 0,
      marginTop: 2,
    },
    avatarText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    body: { flex: 1, minWidth: 0 },
    headerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      marginBottom: 5,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
      flexShrink: 0,
      borderWidth: 1,
    },
    categoryText: {
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
      letterSpacing: 0.2,
    },
    meta: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      flex: 1,
    },
    deleteBtn: {
      marginLeft: 4,
      padding: 2,
    },
    title: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
      lineHeight: 21,
      marginBottom: 3,
    },
    text: {
      color: colors.textPrimary,
      fontSize: typography.sm,
      lineHeight: 20,
    },
    postImage: {
      width: '100%' as const,
      height: 180,
      borderRadius: radius.md,
      marginTop: 10,
    },
    destructRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      marginTop: 8,
      alignSelf: 'flex-start' as const,
      backgroundColor: colors.dangerDim,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    destructText: {
      color: colors.danger,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    actions: {
      flexDirection: 'row' as const,
      marginTop: 12,
      alignItems: 'center' as const,
      gap: 14,
      minHeight: 32,
    },
    actionBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 4,
      flexShrink: 0,
      minHeight: 32,
      minWidth: 28,
    },
    actionCount: {
      color: colors.voteDefault,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
      lineHeight: 16,
    },
    rightActions: {
      flex: 1,
      flexDirection: 'row' as const,
      justifyContent: 'flex-end' as const,
      alignItems: 'center' as const,
      gap: 12,
      minHeight: 32,
    },
  };
}
