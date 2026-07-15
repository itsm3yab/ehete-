import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reply } from '../types';
import { colors, typography, fontWeight, radius } from '../store/theme';
import { formatCount, timeAgo } from './utils';
import { useApp } from '../store/AppContext';

interface Props {
  reply: Reply;
  depth?: number;
  onReplyPress: (reply: Reply) => void;
}

const DEPTH_INDENT = 18;
const MAX_DEPTH_VISUAL = 4;

function ReplyItem({ reply, depth = 0, onReplyPress }: Props) {
  const { state, dispatch } = useApp();
  const isUpvoted = state.upvotedReplyIds.has(reply.id);
  const isDownvoted = state.downvotedReplyIds.has(reply.id);
  const indent = Math.min(depth, MAX_DEPTH_VISUAL) * DEPTH_INDENT;

  return (
    <View>
      {/* Thread connector line */}
      {depth > 0 && (
        <View style={[styles.threadWrap, { marginLeft: indent - DEPTH_INDENT + 16 }]}>
          <View style={styles.threadLine} />
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.container,
          { paddingLeft: 16 + indent },
          pressed && styles.pressed,
        ]}
        onPress={() => onReplyPress(reply)}
        accessible
        accessibilityLabel={`Reply by ${reply.authorId}: ${reply.text}`}
      >
        {/* Avatar */}
        <View style={styles.avatarCol}>
          <View style={[styles.avatar, depth > 0 && styles.avatarSmall]}>
            <Text style={[styles.avatarText, depth > 0 && styles.avatarTextSmall]}>
              {reply.authorId.charAt(0).toUpperCase()}
            </Text>
          </View>
          {reply.replies.length > 0 && <View style={styles.childConnector} />}
        </View>

        {/* Content */}
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.author}>@{reply.authorId}</Text>
            <Text style={styles.time}>{timeAgo(reply.timestamp)}</Text>
          </View>

          <Text style={styles.text}>{reply.text}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => dispatch({ type: 'TOGGLE_REPLY_UPVOTE', payload: reply.id })}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Ionicons
                name={isUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                size={16}
                color={isUpvoted ? colors.upvote : colors.voteDefault}
              />
              {reply.upvotes > 0 && (
                <Text style={[styles.actionCount, isUpvoted && { color: colors.upvote }]}>
                  {formatCount(reply.upvotes)}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => dispatch({ type: 'TOGGLE_REPLY_DOWNVOTE', payload: reply.id })}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Ionicons
                name={isDownvoted ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
                size={16}
                color={isDownvoted ? colors.downvote : colors.voteDefault}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onReplyPress(reply)}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Ionicons name="chatbubble-outline" size={14} color={colors.voteDefault} />
              <Text style={styles.replyLabel}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>

      {/* Nested replies */}
      {reply.replies.map((nested) => (
        <ReplyItem
          key={nested.id}
          reply={nested}
          depth={depth + 1}
          onReplyPress={onReplyPress}
        />
      ))}
    </View>
  );
}

export default memo(ReplyItem);

const styles = StyleSheet.create({
  threadWrap: {
    height: 8,
    width: 1,
    alignSelf: 'flex-start',
  },
  threadLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: colors.border,
    marginLeft: 19,
  },
  container: {
    flexDirection: 'row',
    paddingRight: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
    gap: 10,
  },
  pressed: { backgroundColor: colors.bgPressed },
  avatarCol: {
    alignItems: 'center',
    flexShrink: 0,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarText: {
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    fontSize: typography.sm,
  },
  avatarTextSmall: {
    fontSize: typography.xs,
  },
  childConnector: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
    minHeight: 8,
  },
  body: { flex: 1, minWidth: 0 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  author: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: typography.sm,
  },
  time: { color: colors.textSecondary, fontSize: typography.xs },
  text: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    lineHeight: 20,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 7,
    gap: 16,
    alignItems: 'center',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: {
    color: colors.voteDefault,
    fontSize: typography.xs,
    fontWeight: fontWeight.medium,
  },
  replyLabel: {
    color: colors.voteDefault,
    fontSize: typography.xs,
    fontWeight: fontWeight.medium,
  },
});
