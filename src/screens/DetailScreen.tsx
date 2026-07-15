import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ReplyItem from '../components/ReplyItem';
import { SkeletonReply } from '../components/SkeletonCard';
import { useAuthGate } from '../components/AuthGate';
import { Reply, Confession } from '../types';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { getCategoryTheme, formatCount, timeAgo, estimatedViews } from '../components/utils';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';

export default function DetailScreen({ route, navigation }: any) {
  const styles = useThemedStyles(makeDetailStyles);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { confession }: { confession: Confession } = route.params;
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();
  const { hideTabBar, showTabBar } = useTabBarScroll();
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<FlatList>(null);

  // Hide bottom nav so the composer sits flush above the keyboard (X-style)
  useFocusEffect(
    useCallback(() => {
      hideTabBar();
      return () => showTabBar();
    }, [hideTabBar, showTabBar])
  );

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const onHide = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);


  const current = state.confessions.find((c) => c.id === confession.id) ?? confession;
  const isUpvoted = state.upvotedIds.has(current.id);
  const isDownvoted = state.downvotedIds.has(current.id);
  const isSaved = state.savedIds.has(current.id);

  const netVotes = current.upvotes - current.downvotes;
  const views = estimatedViews(current.upvotes, current.downvotes, current.replyCount);
  const theme = getCategoryTheme(current.category);
  const authorLabel = current.authorId ? `@${current.authorId}` : 'anonymous';

  const topReplies = useMemo(
    () => state.replies.filter((r) => r.confessionId === current.id && !r.parentReplyId),
    [state.replies, current.id]
  );

  const handleSendReply = useCallback(() => {
    if (!requireAuth('Sign in to reply to confessions.')) return;
    const text = replyText.trim();
    if (!text) return;
    const newReply: Reply = {
      id: String(Date.now()),
      confessionId: current.id,
      authorId: state.username || 'anonymous',
      text,
      timestamp: Date.now(),
      upvotes: 0,
      downvotes: 0,
      replies: [],
      parentReplyId: replyingTo?.id ?? null,
    };
    dispatch({ type: 'ADD_REPLY', payload: newReply });
    setReplyText('');
    setReplyingTo(null);
    inputRef.current?.blur();
  }, [replyText, replyingTo, current.id, state.username, dispatch, requireAuth]);

  const handleReplyPress = useCallback((reply: Reply) => {
    if (!requireAuth('Sign in to reply.')) return;
    setReplyingTo(reply);
    inputRef.current?.focus();
  }, [requireAuth]);

  const guardComposerFocus = useCallback(() => {
    if (!requireAuth('Sign in to reply to confessions.')) {
      inputRef.current?.blur();
    }
  }, [requireAuth]);

  const handleReport = useCallback(() => {
    Alert.alert(
      'Report Confession',
      "We'll review this and take action if it violates community guidelines.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you.') },
      ]
    );
  }, []);

  const handleShare = useCallback(async () => {
    await Share.share({
      message: `[${current.category}] ${current.text}\n\nShared from Etete`,
    });
  }, [current]);

  const voteColor = isUpvoted ? colors.upvote : isDownvoted ? colors.downvote : colors.voteDefault;

  const ListHeader = useMemo(() => (
    <View>
      {/* Confession card */}
      <View style={styles.confessionCard}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <View style={[styles.avatar, { backgroundColor: theme.dot }]}>
            <Text style={styles.avatarText}>{current.category.charAt(0)}</Text>
          </View>
          <View style={styles.authorInfo}>
            <View style={[styles.catBadge, { backgroundColor: theme.bg }]}>
              <Text style={[styles.catText, { color: theme.text }]}>{current.category}</Text>
            </View>
            <Text style={styles.meta}>{authorLabel} · {timeAgo(current.timestamp)}</Text>
          </View>
        </View>

        {/* Title */}
        {current.title.length > 0 && (
          <Text style={styles.title}>{current.title}</Text>
        )}

        {/* Body */}
        <Text style={styles.body}>{current.text}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="arrow-up-outline" size={13} color={colors.textMeta} />
            <Text style={styles.statText}>{formatCount(current.upvotes)} upvotes</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={13} color={colors.textMeta} />
            <Text style={styles.statText}>{formatCount(current.replyCount)} replies</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Ionicons name="bar-chart-outline" size={13} color={colors.textMeta} />
            <Text style={styles.statText}>{formatCount(views)} views</Text>
          </View>
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          {/* Upvote */}
          <TouchableOpacity
            style={[styles.voteBtn, isUpvoted && styles.voteBtnUpActive]}
            onPress={() => {
              if (!requireAuth('Sign in to like confessions.')) return;
              dispatch({ type: 'TOGGLE_UPVOTE', payload: current.id });
            }}
            accessibilityLabel={isUpvoted ? 'Remove upvote' : 'Upvote'}
          >
            <Ionicons
              name={isUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={20}
              color={isUpvoted ? colors.upvote : colors.voteDefault}
            />
            <Text style={[styles.voteBtnText, { color: voteColor }]}>
              {formatCount(netVotes)}
            </Text>
          </TouchableOpacity>

          {/* Downvote */}
          <TouchableOpacity
            style={[styles.voteBtn, isDownvoted && styles.voteBtnDownActive]}
            onPress={() => {
              if (!requireAuth('Sign in to vote on confessions.')) return;
              dispatch({ type: 'TOGGLE_DOWNVOTE', payload: current.id });
            }}
            accessibilityLabel={isDownvoted ? 'Remove downvote' : 'Downvote'}
          >
            <Ionicons
              name={isDownvoted ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
              size={20}
              color={isDownvoted ? colors.downvote : colors.voteDefault}
            />
          </TouchableOpacity>

          <View style={styles.spacer} />

          {/* Save */}
          <TouchableOpacity
            style={styles.iconAction}
            onPress={() => {
              if (!requireAuth('Sign in to save confessions.')) return;
              dispatch({ type: 'TOGGLE_SAVE', payload: current.id });
            }}
            accessibilityLabel={isSaved ? 'Unsave' : 'Save'}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? colors.accent : colors.voteDefault}
            />
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.iconAction} onPress={handleShare} accessibilityLabel="Share">
            <Ionicons name="share-outline" size={20} color={colors.voteDefault} />
          </TouchableOpacity>

          {/* Report */}
          <TouchableOpacity style={styles.iconAction} onPress={handleReport} accessibilityLabel="Report">
            <Ionicons name="flag-outline" size={19} color={colors.voteDefault} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Replies header */}
      <View style={styles.repliesHeader}>
        <Text style={styles.repliesTitle}>
          {topReplies.length > 0 ? `${current.replyCount} Replies` : 'Replies'}
        </Text>
      </View>

      {topReplies.length === 0 && !state.isLoading && (
        <View style={styles.noRepliesWrap}>
          <Ionicons name="chatbubble-outline" size={36} color={colors.textMeta} />
          <Text style={styles.noReplies}>Be the first to reply</Text>
        </View>
      )}
    </View>
  ), [current, isUpvoted, isDownvoted, isSaved, topReplies.length, state.isLoading, netVotes, views, voteColor, theme, requireAuth, dispatch, handleShare, handleReport, authorLabel]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Confession</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {state.isLoading ? (
          <>
            {ListHeader}
            <SkeletonReply />
            <SkeletonReply />
            <SkeletonReply />
          </>
        ) : (
          <FlatList
            ref={scrollRef}
            data={topReplies}
            keyExtractor={(r) => r.id}
            ListHeaderComponent={ListHeader}
            renderItem={({ item }) => (
              <ReplyItem reply={item} depth={0} onReplyPress={handleReplyPress} />
            )}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}

        <View
          style={[
            styles.composer,
            { paddingBottom: keyboardOpen ? 6 : Math.max(insets.bottom, 6) },
          ]}
        >
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <Ionicons name="return-down-forward-outline" size={14} color={colors.accent} />
              <Text style={styles.replyingText}>
                Replying to{' '}
                <Text style={{ color: colors.accent, fontWeight: fontWeight.semibold }}>
                  @{replyingTo.authorId}
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close" size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.composerRow}>
            <TextInput
              ref={inputRef}
              style={styles.composerInput}
              placeholder={state.isLoggedIn ? 'Add a reply...' : 'Sign in to reply...'}
              placeholderTextColor={colors.textMeta}
              value={replyText}
              onChangeText={setReplyText}
              onFocus={guardComposerFocus}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendReply}
              disabled={!replyText.trim() && state.isLoggedIn}
              accessibilityLabel="Send reply"
            >
              <Ionicons name="send" size={17} color={replyText.trim() ? '#fff' : colors.textMeta} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



function makeDetailStyles(colors: ColorPalette) {
  return {
  container: { flex: 1, backgroundColor: colors.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  navTitle: { color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: typography.base },
  confessionCard: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.lg },
  authorInfo: { flex: 1, gap: 3 },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  catText: { fontSize: typography.xs, fontWeight: fontWeight.semibold },
  meta: { color: colors.textSecondary, fontSize: typography.xs },
  title: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: typography.lg,
    lineHeight: 26,
    marginBottom: 8,
  },
  body: {
    color: colors.textPrimary,
    fontSize: typography.base,
    lineHeight: 24,
    opacity: 0.92,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSubtle,
    gap: 8,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: colors.textMeta, fontSize: typography.xs },
  statDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMeta },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  voteBtnUpActive: { borderColor: colors.upvote, backgroundColor: colors.upvoteDim },
  voteBtnDownActive: { borderColor: colors.downvote, backgroundColor: colors.downvoteDim },
  voteBtnText: { fontSize: typography.sm, fontWeight: fontWeight.semibold },
  spacer: { flex: 1 },
  iconAction: {
    padding: 8,
    borderRadius: radius.full,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  repliesTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: typography.base,
  },
  noRepliesWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  noReplies: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  composer: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  replyingText: { color: colors.textSecondary, fontSize: typography.xs, flex: 1 },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: typography.sm,
    maxHeight: 110,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.bgElevated },
};
}
