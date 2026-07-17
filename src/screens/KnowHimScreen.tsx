import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAuthGate } from '../components/AuthGate';
import {
  GUY_CONCERNS,
  GUY_TIP_TAGS,
  GuyCheck,
  GuyCheckTip,
  GuyConcern,
  GuyTipTag,
} from '../types';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { formatCount, timeAgo } from '../components/utils';
import { hapticSelect, hapticSuccess } from '../utils/haptics';

const CONCERN_ICON: Record<GuyConcern, keyof typeof Ionicons.glyphMap> = {
  'Married?': 'people-outline',
  Dangerous: 'flash-outline',
  'Serial cheater': 'heart-dislike-outline',
  Scammer: 'cash-outline',
  'Fake identity': 'glasses-outline',
  'Just checking': 'help-circle-outline',
};

const TAB_CLEARANCE = 110;

function TipRow({
  tip,
  thanked,
  onThanks,
}: {
  tip: GuyCheckTip;
  thanked: boolean;
  onThanks: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipTag}>
        <Text style={styles.tipTagText}>{tip.tag}</Text>
      </View>
      <Text style={styles.tipText}>{tip.text}</Text>
      <View style={styles.tipFooter}>
        <Text style={styles.tipMeta}>Anonymous · {timeAgo(tip.timestamp)}</Text>
        <TouchableOpacity style={styles.thanksMini} onPress={onThanks} hitSlop={8}>
          <Ionicons
            name={thanked ? 'heart' : 'heart-outline'}
            size={13}
            color={thanked ? colors.upvote : colors.textSecondary}
          />
          <Text style={[styles.thanksMiniText, thanked && { color: colors.upvote }]}>
            {formatCount(tip.helpfulCount)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CheckCard({
  item,
  tips,
  expanded,
  onToggle,
  onHelp,
  thankedTipIds,
  onThanksTip,
}: {
  item: GuyCheck;
  tips: GuyCheckTip[];
  expanded: boolean;
  onToggle: () => void;
  onHelp: () => void;
  thankedTipIds: Set<string>;
  onThanksTip: (id: string) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
        <View style={styles.cardTop}>
          <View style={styles.concernPill}>
            <Ionicons name={CONCERN_ICON[item.concern]} size={13} color={colors.accent} />
            <Text style={styles.concernText}>{item.concern}</Text>
          </View>
          <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
        </View>

        <Text style={styles.name}>{item.nameOrNick}</Text>
        <View style={styles.areaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.area}>{item.area}</Text>
        </View>
        <Text style={styles.details} numberOfLines={expanded ? 20 : 3}>
          {item.details}
        </Text>
        <Text style={styles.tipCount}>
          {item.tipCount} sister tip{item.tipCount === 1 ? '' : 's'} · tap to{' '}
          {expanded ? 'hide' : 'read'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.tipsBlock}>
          {tips.length === 0 ? (
            <Text style={styles.noTips}>No tips yet — be the first sister to help.</Text>
          ) : (
            tips.map((t) => (
              <TipRow
                key={t.id}
                tip={t}
                thanked={thankedTipIds.has(t.id)}
                onThanks={() => onThanksTip(t.id)}
              />
            ))
          )}
          <TouchableOpacity style={styles.helpBtn} onPress={onHelp} activeOpacity={0.9}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
            <Text style={styles.helpBtnText}>I know something</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function KnowHimScreen() {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipForId, setTipForId] = useState<string | null>(null);

  const [nameOrNick, setNameOrNick] = useState('');
  const [area, setArea] = useState('');
  const [concern, setConcern] = useState<GuyConcern>('Just checking');
  const [details, setDetails] = useState('');

  const [tipTag, setTipTag] = useState<GuyTipTag>('Avoid him');
  const [tipText, setTipText] = useState('');
  const [filter, setFilter] = useState<GuyConcern | 'All'>('All');

  const list = useMemo(() => {
    let items = [...state.guyChecks];
    if (filter !== 'All') items = items.filter((g) => g.concern === filter);
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [state.guyChecks, filter]);

  const canSubmitCheck =
    nameOrNick.trim().length > 0 && area.trim().length > 0 && details.trim().length > 0;
  const canSubmitTip = tipText.trim().length > 0;
  const fabBottom = Math.max(insets.bottom, 8) + TAB_CLEARANCE;

  const openCompose = () => {
    if (!requireAuth('Sign in to ask sisters about someone.')) return;
    setComposeOpen(true);
  };

  const openTip = (checkId: string) => {
    if (!requireAuth('Sign in to share what you know.')) return;
    setTipForId(checkId);
    setTipTag('Avoid him');
    setTipText('');
    setTipOpen(true);
  };

  const submitCheck = () => {
    const n = nameOrNick.trim();
    const a = area.trim();
    const d = details.trim();
    if (!n) {
      Alert.alert('Add a name', 'Use a nickname, first name, or how you know him.');
      return;
    }
    if (!a) {
      Alert.alert('Add an area', 'City, neighborhood, or app where you met helps sisters.');
      return;
    }
    if (!d) {
      Alert.alert('Add details', 'Say why you are unsure — sisters need context.');
      return;
    }
    const check: GuyCheck = {
      id: `g-${Date.now()}`,
      nameOrNick: n,
      area: a,
      concern,
      details: d,
      timestamp: Date.now(),
      authorId: state.username,
      tipCount: 0,
    };
    dispatch({ type: 'ADD_GUY_CHECK', payload: check });
    hapticSuccess();
    setNameOrNick('');
    setArea('');
    setConcern('Just checking');
    setDetails('');
    setComposeOpen(false);
    setExpandedId(check.id);
  };

  const submitTip = () => {
    if (!tipForId) return;
    const t = tipText.trim();
    if (!t) {
      Alert.alert('Add a tip', 'Share only what you honestly know.');
      return;
    }
    dispatch({
      type: 'ADD_GUY_TIP',
      payload: {
        id: `gt-${Date.now()}`,
        checkId: tipForId,
        tag: tipTag,
        text: t,
        timestamp: Date.now(),
        authorId: state.username,
        helpfulCount: 0,
      } as GuyCheckTip,
    });
    hapticSuccess();
    setTipOpen(false);
    setTipForId(null);
    setTipText('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderTitle}>Do You Know Him?</Text>
      </View>

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          keyboardShouldPersistTaps="handled"
        >
          {(['All', ...GUY_CONCERNS] as const).map((t) => {
            const active = filter === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => {
                  hapticSelect();
                  setFilter(t);
                }}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(g) => g.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: fabBottom + 72 },
          list.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="eye-outline" size={44} color={colors.textMeta} />
            <Text style={styles.emptyTitle}>No checks yet</Text>
            <Text style={styles.emptySub}>Ask sisters if they know who you are talking to.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <CheckCard
            item={item}
            tips={state.guyTips
              .filter((t) => t.checkId === item.id)
              .sort((a, b) => b.timestamp - a.timestamp)}
            expanded={expandedId === item.id}
            onToggle={() => {
              hapticSelect();
              setExpandedId((id) => (id === item.id ? null : item.id));
            }}
            onHelp={() => openTip(item.id)}
            thankedTipIds={state.thankedGuyTipIds}
            onThanksTip={(id) => {
              if (!requireAuth('Sign in to thank a sister.')) return;
              hapticSelect();
              dispatch({ type: 'TOGGLE_GUY_TIP_HELPFUL', payload: id });
            }}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={openCompose}
        accessibilityLabel="Ask about a guy"
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Ask sisters</Text>
      </TouchableOpacity>

      <Modal visible={composeOpen} animationType="slide" onRequestClose={() => setComposeOpen(false)}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.composeHeader}>
              <TouchableOpacity onPress={() => setComposeOpen(false)} hitSlop={8}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.composeTitle}>Ask about him</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.postBtn,
                  !canSubmitCheck && styles.postBtnDisabled,
                  pressed && canSubmitCheck && { opacity: 0.85 },
                ]}
                onPress={submitCheck}
                disabled={!canSubmitCheck}
              >
                <Text style={[styles.postBtnText, !canSubmitCheck && styles.postBtnTextDisabled]}>
                  Post
                </Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.composeBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Name / nickname / how to spot him</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Dawit · works near Bole · white Land Cruiser"
                placeholderTextColor={colors.textMeta}
                value={nameOrNick}
                onChangeText={setNameOrNick}
              />
              <Text style={styles.label}>Area / where you met</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Addis · CMC, or Instagram / Telegram"
                placeholderTextColor={colors.textMeta}
                value={area}
                onChangeText={setArea}
              />
              <Text style={styles.label}>What are you worried about?</Text>
              <View style={styles.typeGrid}>
                {GUY_CONCERNS.map((c) => {
                  const active = concern === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                      onPress={() => setConcern(c)}
                    >
                      <Ionicons
                        name={CONCERN_ICON[c]}
                        size={14}
                        color={active ? colors.accent : colors.textSecondary}
                      />
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.label}>Your story</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Why are you unsure? What made you ask?"
                placeholderTextColor={colors.textMeta}
                value={details}
                onChangeText={setDetails}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal visible={tipOpen} animationType="slide" onRequestClose={() => setTipOpen(false)}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.composeHeader}>
              <TouchableOpacity onPress={() => setTipOpen(false)} hitSlop={8}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.composeTitle}>Share a tip</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.postBtn,
                  !canSubmitTip && styles.postBtnDisabled,
                  pressed && canSubmitTip && { opacity: 0.85 },
                ]}
                onPress={submitTip}
                disabled={!canSubmitTip}
              >
                <Text style={[styles.postBtnText, !canSubmitTip && styles.postBtnTextDisabled]}>
                  Send
                </Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.composeBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Quick tag</Text>
              <View style={styles.typeGrid}>
                {GUY_TIP_TAGS.map((t) => {
                  const active = tipTag === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                      onPress={() => setTipTag(t)}
                    >
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.label}>What do you know?</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Be honest and specific."
                placeholderTextColor={colors.textMeta}
                value={tipText}
                onChangeText={setTipText}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    tabHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      alignItems: 'center' as const,
    },
    tabHeaderTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    filterWrap: {
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderSubtle,
    },
    filterRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.full,
      backgroundColor: colors.bgInput,
    },
    filterChipActive: {
      backgroundColor: colors.accentDim,
    },
    filterChipText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
    },
    filterChipTextActive: {
      color: colors.accent,
      fontWeight: fontWeight.semibold,
    },
    list: {
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    listEmpty: { flexGrow: 1 },
    separator: { height: 10 },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    cardTop: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    concernPill: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      backgroundColor: colors.accentDim,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
      maxWidth: '75%' as const,
    },
    concernText: {
      color: colors.accent,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    time: { color: colors.textMeta, fontSize: typography.xs, flexShrink: 0 },
    name: {
      color: colors.textPrimary,
      fontSize: typography.base,
      fontWeight: fontWeight.bold,
    },
    areaRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
    area: { color: colors.textSecondary, fontSize: typography.xs, flex: 1 },
    details: {
      color: colors.textPrimary,
      fontSize: typography.sm,
      lineHeight: 20,
    },
    tipCount: {
      color: colors.accent,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
      marginTop: 2,
    },
    tipsBlock: {
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: 10,
    },
    noTips: { color: colors.textMeta, fontSize: typography.xs },
    tipRow: {
      backgroundColor: colors.bgInput,
      borderRadius: radius.sm,
      padding: 10,
      gap: 6,
    },
    tipTag: {
      alignSelf: 'flex-start' as const,
      backgroundColor: colors.dangerDim,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    tipTagText: {
      color: colors.danger,
      fontSize: 10,
      fontWeight: fontWeight.semibold,
    },
    tipText: {
      color: colors.textPrimary,
      fontSize: typography.sm,
      lineHeight: 19,
    },
    tipFooter: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    tipMeta: { color: colors.textMeta, fontSize: typography.xs },
    thanksMini: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
    thanksMiniText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
    },
    helpBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      backgroundColor: colors.accent,
      paddingVertical: 11,
      borderRadius: radius.full,
      marginTop: 2,
    },
    helpBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
    empty: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 32,
      gap: 8,
      paddingBottom: 40,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.lg,
    },
    emptySub: { color: colors.textMeta, fontSize: typography.sm, textAlign: 'center' as const },
    fab: {
      position: 'absolute' as const,
      right: 16,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      backgroundColor: colors.accent,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: radius.full,
      zIndex: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#e11d6a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 6 },
        default: {},
      }),
    },
    fabText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.sm },
    composeHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    cancel: { color: colors.textSecondary, fontSize: typography.sm, minWidth: 56 },
    composeTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    postBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: radius.full,
      minWidth: 64,
      alignItems: 'center' as const,
    },
    postBtnDisabled: {
      backgroundColor: colors.bgInput,
    },
    postBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.sm },
    postBtnTextDisabled: { color: colors.textMeta },
    composeBody: { padding: 16, gap: 12, paddingBottom: 40 },
    label: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
      marginTop: 4,
    },
    input: {
      backgroundColor: colors.bgInput,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.textPrimary,
      fontSize: typography.sm,
    },
    inputMulti: { minHeight: 110 },
    typeGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
    typeChip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: radius.full,
      backgroundColor: colors.bgInput,
    },
    typeChipActive: {
      backgroundColor: colors.accentDim,
    },
    typeChipText: { color: colors.textSecondary, fontSize: typography.xs },
    typeChipTextActive: {
      color: colors.accent,
      fontWeight: fontWeight.semibold,
    },
  };
}
