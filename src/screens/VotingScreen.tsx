import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
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
import { useAuthGate } from '../components/AuthGate';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { formatCount } from '../components/utils';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';
import { hapticLight, hapticSelect, hapticSuccess } from '../utils/haptics';
import { Poll } from '../types';

const MAX_OPTIONS = 3;

const START_CHOICES = [
  { id: 'now', label: 'Now', offsetMs: 0 },
  { id: '1h', label: 'In 1 hour', offsetMs: 1 * 60 * 60 * 1000 },
  { id: '6h', label: 'In 6 hours', offsetMs: 6 * 60 * 60 * 1000 },
  { id: '1d', label: 'Tomorrow', offsetMs: 24 * 60 * 60 * 1000 },
] as const;

const DURATION_CHOICES = [
  { id: '1h', label: '1 hour', ms: 1 * 60 * 60 * 1000 },
  { id: '6h', label: '6 hours', ms: 6 * 60 * 60 * 1000 },
  { id: '12h', label: '12 hours', ms: 12 * 60 * 60 * 1000 },
  { id: '1d', label: '1 day', ms: 24 * 60 * 60 * 1000 },
  { id: '3d', label: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { id: '7d', label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
] as const;

function formatWhen(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function pollStatus(poll: Poll, now: number): 'upcoming' | 'live' | 'ended' {
  if (now < poll.startAt) return 'upcoming';
  if (now > poll.endAt) return 'ended';
  return 'live';
}

export default function VotingScreen() {
  const styles = useThemedStyles(makeVotingStyles);
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();
  const { onScroll } = useTabBarScroll();
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [startChoice, setStartChoice] = useState<(typeof START_CHOICES)[number]['id']>('now');
  const [durationChoice, setDurationChoice] =
    useState<(typeof DURATION_CHOICES)[number]['id']>('1d');
  const [tick, setTick] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const polls = useMemo(
    () => [...state.polls].sort((a, b) => b.timestamp - a.timestamp),
    [state.polls]
  );

  const startOffset =
    START_CHOICES.find((c) => c.id === startChoice)?.offsetMs ?? 0;
  const durationMs =
    DURATION_CHOICES.find((c) => c.id === durationChoice)?.ms ??
    24 * 60 * 60 * 1000;
  const previewStart = tick + startOffset;
  const previewEnd = previewStart + durationMs;

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setStartChoice('now');
    setDurationChoice('1d');
  };

  const openAsk = () => {
    if (!requireAuth('Sign in to ask a voting question.')) return;
    hapticLight();
    resetForm();
    setAskOpen(true);
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const filledOptions = options.map((o) => o.trim()).filter(Boolean);
  const canSubmit =
    question.trim().length > 0 &&
    filledOptions.length >= 2 &&
    filledOptions.length <= MAX_OPTIONS;

  const submitPoll = () => {
    const q = question.trim();
    if (!canSubmit) return;

    const startAt = Date.now() + startOffset;
    const endAt = startAt + durationMs;
    if (endAt <= startAt) {
      Alert.alert('Invalid time', 'Stop time must be after start time.');
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
      Alert.alert('Not open yet', `Voting starts ${formatWhen(poll.startAt)}.`);
      return;
    }
    if (status === 'ended') {
      Alert.alert('Voting ended', `This vote closed ${formatWhen(poll.endAt)}.`);
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

    return (
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              status === 'live' && styles.statusLive,
              status === 'upcoming' && styles.statusUpcoming,
              status === 'ended' && styles.statusEnded,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === 'live' && { color: colors.success },
                status === 'upcoming' && { color: colors.accent },
                status === 'ended' && { color: colors.textSecondary },
              ]}
            >
              {status === 'live'
                ? 'Live'
                : status === 'upcoming'
                  ? 'Upcoming'
                  : 'Ended'}
            </Text>
          </View>
          <Text style={styles.meta}>
            {formatCount(total)} votes · {item.authorId}
          </Text>
        </View>

        <Text style={styles.question}>{item.question}</Text>
        <Text style={styles.timeLine}>
          Starts {formatWhen(item.startAt)} · Ends {formatWhen(item.endAt)}
        </Text>

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
          <Text style={styles.hint}>Opens {formatWhen(item.startAt)}</Text>
        )}
        {status === 'ended' && (
          <Text style={styles.hint}>Closed {formatWhen(item.endAt)}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Voting</Text>
          <Text style={styles.subtitle}>Ask · set times · up to 3 options</Text>
        </View>
        <TouchableOpacity style={styles.askBtn} onPress={openAsk} accessibilityRole="button">
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.askBtnText}>Ask</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={polls}
        keyExtractor={(p) => p.id}
        renderItem={renderPoll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
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
            <Ionicons name="bar-chart-outline" size={48} color={colors.textMeta} />
            <Text style={styles.emptyTitle}>No questions yet</Text>
            <Text style={styles.emptyText}>Be the first to ask something to vote on.</Text>
          </View>
        }
      />

      <Modal visible={askOpen} transparent animationType="fade" onRequestClose={() => setAskOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAskOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.modalTitle}>Ask a vote</Text>

              <Text style={styles.fieldLabel}>Question</Text>
              <TextInput
                style={styles.input}
                placeholder="What should people vote on?"
                placeholderTextColor={colors.textMeta}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={160}
              />

              <Text style={styles.fieldLabel}>Options (max {MAX_OPTIONS})</Text>
              {options.map((opt, index) => (
                <View key={index} style={styles.optionInputRow}>
                  <TextInput
                    style={[styles.inputSingle, { flex: 1 }]}
                    placeholder={`Option ${index + 1}${index < 2 ? '' : ' (optional)'}`}
                    placeholderTextColor={colors.textMeta}
                    value={opt}
                    onChangeText={(v) => updateOption(index, v)}
                    maxLength={60}
                  />
                  {options.length > 2 && (
                    <TouchableOpacity
                      onPress={() => removeOption(index)}
                      hitSlop={8}
                      style={styles.removeOpt}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.textMeta} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {options.length < MAX_OPTIONS && (
                <TouchableOpacity style={styles.addOptBtn} onPress={addOption}>
                  <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                  <Text style={styles.addOptText}>Add option</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.fieldLabel}>Start time</Text>
              <View style={styles.chipRow}>
                {START_CHOICES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, startChoice === c.id && styles.chipActive]}
                    onPress={() => setStartChoice(c.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        startChoice === c.id && styles.chipTextActive,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Stop time</Text>
              <View style={styles.chipRow}>
                {DURATION_CHOICES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, durationChoice === c.id && styles.chipActive]}
                    onPress={() => setDurationChoice(c.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        durationChoice === c.id && styles.chipTextActive,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.previewTimes}>
                Starts {formatWhen(previewStart)} · Ends {formatWhen(previewEnd)}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setAskOpen(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
                  disabled={!canSubmit}
                  onPress={submitPoll}
                >
                  <Text style={styles.submitText}>Post vote</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    title: {
      color: colors.textPrimary,
      fontWeight: fontWeight.extrabold,
      fontSize: typography.xl,
      letterSpacing: -0.4,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      marginTop: 2,
    },
    askBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.accent,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radius.full,
    },
    askBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
    list: { padding: 16, paddingBottom: 110 },
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
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
      backgroundColor: colors.bgPressed,
    },
    statusLive: { backgroundColor: colors.successDim },
    statusUpcoming: { backgroundColor: colors.accentDim },
    statusEnded: { backgroundColor: colors.bgPressed },
    statusText: {
      fontSize: typography.xs,
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
    options: { gap: 8, marginTop: 4 },
    option: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: 12,
      paddingHorizontal: 14,
      overflow: 'hidden',
      backgroundColor: colors.bg,
    },
    optionSelected: { borderColor: colors.accent },
    optionDisabled: { opacity: 0.7 },
    optionText: {
      color: colors.textPrimary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    optionTextSelected: {
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
    },
    resultRow: { minHeight: 20, justifyContent: 'center' },
    resultFill: {
      ...StyleSheet.absoluteFill,
      borderRadius: radius.sm,
    },
    resultContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    pct: {
      color: colors.textSecondary,
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
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
    modalSheet: {
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      maxHeight: '92%',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    modalScroll: {
      padding: 20,
      paddingBottom: 32,
      gap: 10,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.lg,
      marginBottom: 4,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
      marginTop: 6,
    },
    input: {
      minHeight: 72,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: 12,
      color: colors.textPrimary,
      fontSize: typography.sm,
      textAlignVertical: 'top',
      backgroundColor: colors.bgInput,
    },
    inputSingle: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 11,
      color: colors.textPrimary,
      fontSize: typography.sm,
      backgroundColor: colors.bgInput,
    },
    optionInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    removeOpt: { padding: 2 },
    addOptBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
    },
    addOptText: {
      color: colors.accent,
      fontWeight: fontWeight.semibold,
      fontSize: typography.sm,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    chipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentDim,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
    },
    chipTextActive: {
      color: colors.accent,
      fontWeight: fontWeight.bold,
    },
    previewTimes: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      marginTop: 2,
      lineHeight: 18,
    },
    modalActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 16,
      marginTop: 12,
    },
    cancelText: {
      color: colors.textSecondary,
      fontWeight: fontWeight.medium,
      fontSize: typography.sm,
    },
    submitBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: radius.full,
    },
    submitDisabled: { opacity: 0.45 },
    submitText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
  };
}
