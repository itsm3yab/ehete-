import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../store/AppContext';
import { useAuthGate } from '../components/AuthGate';
import { useColors, useTheme, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { formatCount, getCategoryTheme } from '../components/utils';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';
import { hapticLight, hapticSelect, hapticSuccess } from '../utils/haptics';
import EndDateCalendar from '../components/EndDateCalendar';
import SideDrawer, { DrawerAvatarButton } from '../components/SideDrawer';
import { CATEGORIES, Poll } from '../types';
import type { Category } from '../types';

const MAX_OPTIONS = 3;

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function defaultEndDate() {
  const d = startOfDay();
  d.setDate(d.getDate() + 3);
  return d;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' as const }),
  });
}

function pollStatus(poll: Poll, now: number): 'upcoming' | 'live' | 'ended' {
  if (now < poll.startAt) return 'upcoming';
  if (now > poll.endAt) return 'ended';
  return 'live';
}

const LIVE_RED = '#FF2D55';

/** Pulsing broadcast-style live indicator */
function LivePulseDot({ size = 8, active = true }: { size?: number; active?: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0],
  });

  return (
    <View style={{ width: size * 2.4, height: size * 2.4, alignItems: 'center', justifyContent: 'center' }}>
      {active && (
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: LIVE_RED,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          }}
        />
      )}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? LIVE_RED : '#8E8E93',
        }}
      />
    </View>
  );
}

export default function VotingScreen({ navigation }: any) {
  const styles = useThemedStyles(makeVotingStyles);
  const colors = useColors();
  const { mode } = useTheme();
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();
  const { onScroll, hideTabBar, showTabBar } = useTabBarScroll();
  const [askOpen, setAskOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [pollCategory, setPollCategory] = useState<Category | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [tick, setTick] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'live' | 'results'>('live');
  const isFocused = useIsFocused();

  useFocusEffect(
    React.useCallback(() => {
      hideTabBar();
      return () => showTabBar();
    }, [hideTabBar, showTabBar])
  );

  React.useEffect(() => {
    if (!isFocused) return;
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [isFocused]);

  const filteredPolls = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...state.polls];
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.question.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.options.some((o) => o.text.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [state.polls, searchQuery, categoryFilter]);

  const livePolls = useMemo(
    () => filteredPolls.filter((p) => pollStatus(p, tick) !== 'ended'),
    [filteredPolls, tick]
  );
  const resultPolls = useMemo(
    () => filteredPolls.filter((p) => pollStatus(p, tick) === 'ended'),
    [filteredPolls, tick]
  );
  const visiblePolls = tab === 'live' ? livePolls : resultPolls;

  const previewEnd = endOfDay(endDate);

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '', '']);
    setPollCategory(null);
    setEndDate(defaultEndDate());
  };

  const openAsk = () => {
    if (!requireAuth('Sign in to ask a voting question.')) return;
    hapticLight();
    resetForm();
    setAskOpen(true);
  };

  const closeAsk = () => {
    setAskOpen(false);
    resetForm();
  };

  React.useEffect(() => {
    if (askOpen) {
      hideTabBar();
      return () => showTabBar();
    }
  }, [askOpen, hideTabBar, showTabBar]);

  const isGuest = !state.isLoggedIn;
  const displayName = isGuest ? 'Guest' : state.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const openDrawer = () => {
    hapticLight();
    hideTabBar();
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    hapticLight();
    setDrawerOpen(false);
    showTabBar();
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const filledOptions = options.map((o) => o.trim()).filter(Boolean);
  const canSubmit =
    question.trim().length > 0 &&
    !!pollCategory &&
    filledOptions.length >= 2 &&
    filledOptions.length <= MAX_OPTIONS;

  const submitPoll = () => {
    const q = question.trim();
    if (!pollCategory) {
      Alert.alert('Pick a category', 'Choose a category for your question.');
      return;
    }
    if (!canSubmit) return;

    const startAt = Date.now();
    const endAt = endOfDay(endDate);
    if (endAt <= startAt) {
      Alert.alert('Invalid date', 'Pick today or a later end date.');
      return;
    }

    const pollOptions = filledOptions.slice(0, MAX_OPTIONS).map((text, i) => ({
      id: `${Date.now()}_${i}`,
      text,
      votes: 0,
    }));

    dispatch({
      type: 'ADD_POLL',
      payload: {
        id: `poll_${Date.now()}`,
        question: q,
        category: pollCategory,
        options: pollOptions,
        authorId: state.username || 'Anon',
        timestamp: Date.now(),
        startAt,
        endAt,
      },
    });
    hapticSuccess();
    resetForm();
    setAskOpen(false);
    setTab('live');
  };

  const onRefresh = () => {
    setRefreshing(true);
    hapticSelect();
    dispatch({ type: 'SET_LOADING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'LOAD_DATA' });
      setRefreshing(false);
    }, 700);
  };

  const vote = (poll: Poll, optionId: string) => {
    if (!requireAuth('Sign in to vote on this question.')) return;
    const status = pollStatus(poll, Date.now());
    if (status === 'upcoming') {
      Alert.alert('Not open yet', `Voting opens ${formatDate(poll.startAt)}.`);
      return;
    }
    if (status === 'ended') {
      Alert.alert('Voting ended', `This vote closed on ${formatDate(poll.endAt)}.`);
      return;
    }
    hapticSuccess();
    dispatch({ type: 'VOTE_POLL', payload: { pollId: poll.id, optionId } });
  };

  const renderPoll = ({ item }: { item: Poll }) => {
    const total = item.options.reduce((s, o) => s + o.votes, 0);
    const myVote = state.pollVotes[item.id];
    const status = pollStatus(item, tick);
    const canVote = status === 'live';
    const showResults = !!myVote || status === 'ended';
    const catTheme = getCategoryTheme(item.category, mode);

    return (
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={[styles.catBadge, { backgroundColor: catTheme.bg }]}>
            <Text style={[styles.catBadgeText, { color: catTheme.text }]}>
              {item.category}
            </Text>
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {formatCount(total)} votes
          </Text>
        </View>

        <Text style={styles.question}>{item.question}</Text>
        <Text style={styles.timeLine}>Ends {formatDate(item.endAt)}</Text>

        <View style={styles.options}>
          {item.options.slice(0, MAX_OPTIONS).map((opt) => {
            const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
            const selected = myVote === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.option,
                  selected && styles.optionSelected,
                  !canVote && !showResults && styles.optionDisabled,
                ]}
                onPress={() => vote(item, opt.id)}
                activeOpacity={canVote ? 0.75 : 1}
                disabled={!canVote && !showResults}
              >
                {showResults ? (
                  <View style={styles.resultRow}>
                    <View
                      style={[
                        styles.resultFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: selected
                            ? colors.accent + '44'
                            : colors.bgPressed,
                        },
                      ]}
                    />
                    <View style={styles.resultContent}>
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {opt.text}
                      </Text>
                      <Text
                        style={[
                          styles.pct,
                          selected && { color: colors.accent },
                        ]}
                      >
                        {pct}%
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.optionText}>{opt.text}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {status === 'upcoming' && (
          <Text style={styles.hint}>Opens {formatDate(item.startAt)}</Text>
        )}
        {status === 'ended' && (
          <Text style={styles.hint}>Closed {formatDate(item.endAt)}</Text>
        )}
      </View>
    );
  };

  if (askOpen) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.askHeader}>
          <TouchableOpacity
            onPress={closeAsk}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close ask"
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.askHeaderTitle}>Ask a vote</Text>
          <View style={styles.askHeaderSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.askBody}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.askContent}>
            <View style={styles.askSection}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.catChipRow}>
                {CATEGORIES.map((cat) => {
                  const active = pollCategory === cat;
                  const theme = getCategoryTheme(cat, mode);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        active && {
                          backgroundColor: theme.bg,
                          borderColor: theme.dot,
                        },
                      ]}
                      onPress={() => {
                        hapticSelect();
                        setPollCategory(cat);
                      }}
                    >
                      <View style={[styles.catDot, { backgroundColor: theme.dot }]} />
                      <Text
                        style={[
                          styles.catChipText,
                          active && { color: theme.text, fontWeight: fontWeight.bold },
                        ]}
                        numberOfLines={1}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.askSection}>
              <Text style={styles.fieldLabel}>Question</Text>
              <TextInput
                style={styles.askQuestionInput}
                placeholder="What should people vote on?"
                placeholderTextColor={colors.textMeta}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={160}
                returnKeyType="next"
              />
            </View>

            <View style={styles.askSection}>
              <Text style={styles.fieldLabel}>Options</Text>
              <View style={styles.askOptionsCol}>
                {options.map((opt, index) => (
                  <TextInput
                    key={index}
                    style={styles.inputSingle}
                    placeholder={
                      index < 2 ? `Option ${index + 1}` : 'Option 3 (optional)'
                    }
                    placeholderTextColor={colors.textMeta}
                    value={opt}
                    onChangeText={(v) => updateOption(index, v)}
                    maxLength={60}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.askSection, styles.askCalendarSection]}>
              <Text style={styles.fieldLabel}>Ends on</Text>
              <EndDateCalendar value={endDate} onChange={setEndDate} />
              <Text style={styles.previewTimes}>
                Starts today · Closes {formatDate(previewEnd)}
              </Text>
            </View>
          </View>

          <View style={styles.askFooter}>
            <TouchableOpacity
              style={[styles.postBtn, !canSubmit && styles.submitDisabled]}
              disabled={!canSubmit}
              onPress={submitPoll}
              accessibilityRole="button"
            >
              <Text style={styles.postBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Back"
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <DrawerAvatarButton
          onPress={openDrawer}
          initial={initial}
          isGuest={isGuest}
          avatarUri={state.avatarUri}
        />
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={13} color={colors.textMeta} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textMeta}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={14} color={colors.textMeta} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, categoryFilter && styles.filterBtnActive]}
          onPress={() => {
            hapticSelect();
            setFilterOpen(true);
          }}
          accessibilityLabel="Filter by category"
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={categoryFilter ? colors.accent : colors.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.askBtn} onPress={openAsk} accessibilityRole="button">
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.askBtnText}>Ask</Text>
        </TouchableOpacity>
      </View>

      {categoryFilter && (
        <View style={styles.activeFilterRow}>
          <Text style={styles.activeFilterLabel}>Category:</Text>
          <View style={styles.activeFilterChip}>
            <Text style={styles.activeFilterText}>{categoryFilter}</Text>
            <TouchableOpacity
              onPress={() => setCategoryFilter(null)}
              hitSlop={8}
              accessibilityLabel="Clear category filter"
            >
              <Ionicons name="close" size={14} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'live' && styles.tabBtnLiveActive]}
          onPress={() => {
            hapticSelect();
            setTab('live');
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'live' }}
        >
          <LivePulseDot size={8} active={tab === 'live'} />
          <Text style={[styles.tabText, tab === 'live' && styles.tabTextLive]}>
            {tab === 'live' ? 'LIVE' : 'Live'}
          </Text>
          <View style={[styles.tabBadge, tab === 'live' && styles.tabBadgeLive]}>
            <Text style={[styles.tabCount, tab === 'live' && styles.tabCountLive]}>
              {livePolls.length}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'results' && styles.tabBtnActive]}
          onPress={() => {
            hapticSelect();
            setTab('results');
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'results' }}
        >
          <Ionicons
            name="stats-chart"
            size={14}
            color={tab === 'results' ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.tabText, tab === 'results' && styles.tabTextActive]}>Results</Text>
          <View style={[styles.tabBadge, tab === 'results' && styles.tabBadgeActive]}>
            <Text style={[styles.tabCount, tab === 'results' && styles.tabCountActive]}>
              {resultPolls.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visiblePolls}
        keyExtractor={(p) => p.id}
        renderItem={renderPoll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={tab === 'live' ? 'radio-button-on-outline' : 'stats-chart-outline'}
              size={48}
              color={colors.textMeta}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? 'No matches'
                : tab === 'live'
                  ? 'No live questions'
                  : 'No results yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? `Nothing found for "${searchQuery.trim()}"`
                : tab === 'live'
                  ? 'Ask a question to start a live vote.'
                  : 'Closed votes will show up here.'}
            </Text>
          </View>
        }
      />

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        navigation={navigation}
      />

      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.filterSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.filterTitle}>Filter by category</Text>
            <Text style={styles.filterSubtitle}>Find votes in the topics you care about</Text>
            <TouchableOpacity
              style={[styles.filterOption, !categoryFilter && styles.filterOptionActive]}
              onPress={() => {
                hapticSelect();
                setCategoryFilter(null);
                setFilterOpen(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  !categoryFilter && styles.filterOptionTextActive,
                ]}
              >
                All categories
              </Text>
              {!categoryFilter && (
                <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              )}
            </TouchableOpacity>
            {CATEGORIES.map((cat) => {
              const active = categoryFilter === cat;
              const theme = getCategoryTheme(cat, mode);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterOption, active && styles.filterOptionActive]}
                  onPress={() => {
                    hapticSelect();
                    setCategoryFilter(cat);
                    setFilterOpen(false);
                  }}
                >
                  <View style={styles.filterOptionLeft}>
                    <View style={[styles.catDot, { backgroundColor: theme.dot }]} />
                    <Text
                      style={[
                        styles.filterOptionText,
                        active && styles.filterOptionTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </View>
                  {active && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function makeVotingStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 8,
    },
    backBtn: {
      paddingRight: 2,
    },
    askBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.accent,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: radius.full,
    },
    askBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.xs,
    },
    searchWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: colors.bgInput,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      minWidth: 0,
    },
    searchInput: {
      flex: 1,
      padding: 0,
      margin: 0,
      color: colors.textPrimary,
      fontSize: 12,
      minWidth: 0,
    },
    filterBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    filterBtnActive: {
      backgroundColor: colors.accentDim,
      borderColor: colors.accent,
    },
    activeFilterRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      paddingHorizontal: 14,
      paddingTop: 8,
    },
    activeFilterLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: fontWeight.medium,
    },
    activeFilterChip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      backgroundColor: colors.accentDim,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    activeFilterText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: fontWeight.bold,
    },
    tabRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 6,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 10,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    tabBtnActive: {
      backgroundColor: colors.accentDim,
      borderColor: colors.accent,
    },
    tabBtnLiveActive: {
      backgroundColor: 'rgba(255, 45, 85, 0.12)',
      borderColor: LIVE_RED,
      borderWidth: 1.5,
    },
    tabText: {
      color: colors.textSecondary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.sm,
    },
    tabTextActive: {
      color: colors.accent,
      fontWeight: fontWeight.bold,
    },
    tabTextLive: {
      color: LIVE_RED,
      fontWeight: fontWeight.extrabold,
      letterSpacing: 0.8,
      fontSize: typography.sm,
    },
    tabBadge: {
      minWidth: 20,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: radius.full,
      backgroundColor: colors.bgPressed,
      alignItems: 'center',
    },
    tabBadgeActive: {
      backgroundColor: colors.accent + '22',
    },
    tabBadgeLive: {
      backgroundColor: 'rgba(255, 45, 85, 0.18)',
    },
    tabCount: {
      color: colors.textMeta,
      fontSize: 11,
      fontWeight: fontWeight.bold,
    },
    tabCountActive: {
      color: colors.accent,
    },
    tabCountLive: {
      color: LIVE_RED,
    },
    list: { paddingHorizontal: 16, paddingBottom: 110, flexGrow: 1 },
    card: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 12,
      gap: 8,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    catBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
      maxWidth: 120,
    },
    catBadgeText: {
      fontSize: 10,
      fontWeight: fontWeight.bold,
    },
    question: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.md,
      lineHeight: 22,
    },
    meta: {
      color: colors.textSecondary,
      fontSize: typography.xs,
    },
    timeLine: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      marginBottom: 2,
    },
    hint: {
      color: colors.textMeta,
      fontSize: typography.xs,
      marginTop: 2,
    },
    options: { gap: 6, marginTop: 2 },
    option: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingVertical: 8,
      paddingHorizontal: 11,
      overflow: 'hidden',
      backgroundColor: colors.bg,
    },
    optionSelected: { borderColor: colors.accent },
    optionDisabled: { opacity: 0.7 },
    optionText: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: fontWeight.medium,
    },
    optionTextSelected: {
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
    },
    resultRow: { minHeight: 16, justifyContent: 'center' },
    resultFill: {
      ...StyleSheet.absoluteFill,
      borderRadius: radius.xs,
    },
    resultContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    pct: {
      color: colors.textSecondary,
      fontWeight: fontWeight.bold,
      fontSize: 12,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 80,
      gap: 10,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.lg,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      textAlign: 'center',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(15,20,25,0.45)',
      justifyContent: 'flex-end',
    },
    askHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 12,
    },
    askHeaderTitle: {
      flex: 1,
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
      letterSpacing: -0.2,
      textAlign: 'center',
    },
    askHeaderSpacer: {
      width: 22,
    },
    askBody: {
      flex: 1,
    },
    askContent: {
      flex: 1,
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: 4,
      gap: 8,
      justifyContent: 'space-between',
    },
    askSection: {
      gap: 5,
    },
    askCalendarSection: {
      flexShrink: 1,
      minHeight: 0,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: fontWeight.semibold,
      letterSpacing: 0.3,
      textTransform: 'uppercase' as const,
    },
    catChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 7,
    },
    catChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      width: '32%',
      paddingHorizontal: 7,
      paddingVertical: 9,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    catChipText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: fontWeight.medium,
    },
    catDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    askQuestionInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 12,
      minHeight: 72,
      color: colors.textPrimary,
      fontSize: typography.sm,
      backgroundColor: colors.bgInput,
      textAlignVertical: 'top',
    },
    askOptionsCol: {
      gap: 5,
    },
    askFooter: {
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 6,
    },
    postBtn: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: radius.full,
      alignItems: 'center',
    },
    postBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    filterSheet: {
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 28,
      maxHeight: '78%',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    filterTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.lg,
    },
    filterSubtitle: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      marginTop: 4,
      marginBottom: 14,
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: radius.md,
      marginBottom: 4,
    },
    filterOptionActive: {
      backgroundColor: colors.accentDim,
    },
    filterOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    filterOptionText: {
      color: colors.textPrimary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    filterOptionTextActive: {
      color: colors.accent,
      fontWeight: fontWeight.bold,
    },
    inputSingle: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 11,
      paddingVertical: 7,
      color: colors.textPrimary,
      fontSize: typography.sm,
      backgroundColor: colors.bgInput,
    },
    previewTimes: {
      color: colors.textMeta,
      fontSize: 10,
    },
    submitDisabled: { opacity: 0.45 },
  };
}
