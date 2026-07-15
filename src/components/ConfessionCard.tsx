import React, { useCallback } from 'react';
import {
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
import { colors, typography, fontWeight, radius } from '../store/theme';
import { getCategoryTheme, formatCount, categoryInitial, timeAgo, estimatedViews } from './utils';
import { useApp } from '../store/AppContext';

interface Props {
  confession: Confession;
  onPress: () => void;
  showDelete?: boolean;
}

export default function ConfessionCard({ confession, onPress, showDelete = false }: Props) {
  const { state, dispatch } = useApp();
  const isUpvoted = state.upvotedIds.has(confession.id);
  const isDownvoted = state.downvotedIds.has(confession.id);
  const isSaved = state.savedIds.has(confession.id);

  const netVotes = confession.upvotes - confession.downvotes;
  const views = estimatedViews(confession.upvotes, confession.downvotes, confession.replyCount);
  const theme = getCategoryTheme(confession.category);
  const authorLabel = confession.authorId ? `@${confession.authorId}` : 'anonymous';

  const handleShare = useCallback(async () => {
    await Share.share({
      message: `[${confession.category}] ${confession.text}\n\nShared from Etete`,
    });
  }, [confession]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Confession',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_CONFESSION', payload: confession.id }),
        },
      ]
    );
  }, [confession.id, dispatch]);

  const voteColor = isUpvoted ? colors.upvote : isDownvoted ? colors.downvote : colors.voteDefault;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${confession.category} confession: ${confession.title || confession.text.slice(0, 60)}`}
    >
      {/* Left — avatar */}
      <View style={[styles.avatar, { backgroundColor: theme.dot }]}>
        <Text style={styles.avatarText}>{categoryInitial(confession.category)}</Text>
      </View>

      {/* Right — content */}
      <View style={styles.body}>

        {/* Header */}
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

        {/* Title */}
        {confession.title.length > 0 && (
          <Text style={styles.title} numberOfLines={2}>{confession.title}</Text>
        )}

        {/* Body */}
        <Text style={styles.text} numberOfLines={6}>{confession.text}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Upvote + score */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => dispatch({ type: 'TOGGLE_UPVOTE', payload: confession.id })}
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

          {/* Downvote */}
          <TouchableOpacity
            onPress={() => dispatch({ type: 'TOGGLE_DOWNVOTE', payload: confession.id })}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityLabel={isDownvoted ? 'Remove downvote' : 'Downvote'}
          >
            <Ionicons
              name={isDownvoted ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
              size={19}
              color={isDownvoted ? colors.downvote : colors.voteDefault}
            />
          </TouchableOpacity>

          {/* Comments */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onPress}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityLabel={`${confession.replyCount} replies`}
          >
            <Ionicons name="chatbubble-outline" size={17} color={colors.voteDefault} />
            <Text style={styles.actionCount}>{formatCount(confession.replyCount)}</Text>
          </TouchableOpacity>

          {/* Views */}
          <View style={styles.actionBtn}>
            <Ionicons name="bar-chart-outline" size={17} color={colors.voteDefault} />
            <Text style={styles.actionCount}>{formatCount(views)}</Text>
          </View>

          <View style={styles.rightActions}>
            {/* Save */}
            <TouchableOpacity
              onPress={() => dispatch({ type: 'TOGGLE_SAVE', payload: confession.id })}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel={isSaved ? 'Unsave' : 'Save'}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? colors.accent : colors.voteDefault}
              />
            </TouchableOpacity>

            {/* Share */}
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
  );
}

const styles = StyleSheet.create({
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
