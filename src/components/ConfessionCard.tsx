import React, { useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Confession } from '../types';
import { useColors, useTheme, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { getCategoryTheme, formatCount, categoryInitial, timeAgo, estimatedViews } from './utils';
import { useApp } from '../store/AppContext';
import { useAuthGate } from './AuthGate';
import { hapticLight, hapticSelect, hapticSuccess } from '../utils/haptics';

interface Props {
  confession: Confession;
  onPress: () => void;
  showDelete?: boolean;
}

export default function ConfessionCard({ confession, onPress, showDelete = false }: Props) {
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();
  const colors = useColors();
  const { mode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const swipeRef = useRef<Swipeable>(null);

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
      message: `[${confession.category}] ${confession.text}\n\nShared from Etete`,
    });
  }, [confession]);

  const toggleSave = useCallback(() => {
    if (!requireAuth('Sign in to save confessions.')) return;
    hapticSuccess();
    dispatch({ type: 'TOGGLE_SAVE', payload: confession.id });
    swipeRef.current?.close();
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

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-96, -40, 0],
      outputRange: [1, 0.85, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity style={styles.swipeSave} onPress={toggleSave} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color="#fff"
          />
          <Text style={styles.swipeSaveText}>{isSaved ? 'Saved' : 'Save'}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => hapticLight()}
    >
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
          pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityHint="Swipe left to save"
        accessibilityLabel={`${confession.category} confession: ${confession.title || confession.text.slice(0, 60)}`}
      >
        <View style={[styles.avatar, { backgroundColor: theme.dot }]}>
          <Text style={styles.avatarText}>{categoryInitial(confession.category)}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.bg }]}>
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
            <Text style={styles.title} numberOfLines={2}>{confession.title}</Text>
          )}

          <Text style={styles.text} numberOfLines={6}>{confession.text}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                if (!requireAuth('Sign in to like confessions.')) return;
                hapticSelect();
                dispatch({ type: 'TOGGLE_UPVOTE', payload: confession.id });
              }}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel={isUpvoted ? 'Remove upvote' : 'Upvote'}
            >
              <Ionicons
                name={isUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                size={19}
                color={isUpvoted ? colors.upvote : colors.voteDefault}
              />
              <Text style={[styles.actionCount, { color: voteColor }]}>
                {formatCount(netVotes)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!requireAuth('Sign in to vote on confessions.')) return;
                hapticSelect();
                dispatch({ type: 'TOGGLE_DOWNVOTE', payload: confession.id });
              }}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel={isDownvoted ? 'Remove downvote' : 'Downvote'}
            >
              <Ionicons
                name={isDownvoted ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
                size={19}
                color={isDownvoted ? colors.downvote : colors.voteDefault}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleOpen}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel={`${confession.replyCount} replies`}
            >
              <Ionicons name="chatbubble-outline" size={17} color={colors.voteDefault} />
              <Text style={styles.actionCount}>{formatCount(confession.replyCount)}</Text>
            </TouchableOpacity>

            <View style={styles.actionBtn}>
              <Ionicons name="bar-chart-outline" size={17} color={colors.voteDefault} />
              <Text style={styles.actionCount}>{formatCount(views)}</Text>
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity
                onPress={toggleSave}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                accessibilityLabel={isSaved ? 'Unsave' : 'Save'}
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isSaved ? colors.accent : colors.voteDefault}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                accessibilityLabel="Share"
              >
                <Ionicons name="share-outline" size={18} color={colors.voteDefault} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      backgroundColor: colors.bg,
      gap: 11,
    },
    cardPressed: {
      backgroundColor: colors.bgPressed,
    },
    swipeSave: {
      width: 88,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeSaveText: {
      color: '#fff',
      fontSize: typography.xs,
      fontWeight: fontWeight.bold,
      marginTop: 4,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 5,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.full,
      flexShrink: 0,
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
      opacity: 0.9,
    },
    actions: {
      flexDirection: 'row',
      marginTop: 11,
      alignItems: 'center',
      gap: 16,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionCount: {
      color: colors.voteDefault,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
    },
    rightActions: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 14,
    },
  });
}
