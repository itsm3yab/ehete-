import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAuthGate } from '../components/AuthGate';
import { SafetyWarning, WARNING_TYPES, WarningType } from '../types';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { formatCount, timeAgo } from '../components/utils';
import { hapticSelect, hapticSuccess } from '../utils/haptics';

const TYPE_ICON: Record<WarningType, keyof typeof Ionicons.glyphMap> = {
  Harassment: 'hand-left-outline',
  'Unsafe at night': 'moon-outline',
  'Theft / scam': 'wallet-outline',
  'Assault risk': 'flash-outline',
  'Bad transport': 'car-outline',
  Other: 'ellipse-outline',
};

const TAB_CLEARANCE = 110;

function WarningCard({
  warning,
  thanked,
  onThanks,
}: {
  warning: SafetyWarning;
  thanked: boolean;
  onThanks: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.typePill}>
          <Ionicons name={TYPE_ICON[warning.warningType]} size={13} color={colors.danger} />
          <Text style={styles.typeText}>{warning.warningType}</Text>
        </View>
        <Text style={styles.time}>{timeAgo(warning.timestamp)}</Text>
      </View>

      <View style={styles.placeRow}>
        <Ionicons name="location" size={16} color={colors.danger} />
        <Text style={styles.place}>{warning.place}</Text>
      </View>

      <Text style={styles.detail}>{warning.detail}</Text>

      {!!warning.tip && (
        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={14} color={colors.warning} />
          <Text style={styles.tipText}>{warning.tip}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.anon}>Anonymous sister</Text>
        <TouchableOpacity
          style={[styles.thanksBtn, thanked && styles.thanksBtnActive]}
          onPress={onThanks}
          accessibilityLabel={thanked ? 'Remove thanks' : 'Mark as helpful'}
        >
          <Ionicons
            name={thanked ? 'heart' : 'heart-outline'}
            size={15}
            color={thanked ? colors.upvote : colors.textSecondary}
          />
          <Text style={[styles.thanksText, thanked && { color: colors.upvote }]}>
            Helpful · {formatCount(warning.helpfulCount)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SisterAlertsScreen() {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();

  const [composeOpen, setComposeOpen] = useState(false);
  const [place, setPlace] = useState('');
  const [warningType, setWarningType] = useState<WarningType>('Harassment');
  const [detail, setDetail] = useState('');
  const [tip, setTip] = useState('');
  const [filter, setFilter] = useState<WarningType | 'All'>('All');

  const list = useMemo(() => {
    let items = [...state.warnings];
    if (filter !== 'All') items = items.filter((w) => w.warningType === filter);
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [state.warnings, filter]);

  const canSubmit = place.trim().length > 0 && detail.trim().length > 0;
  const fabBottom = Math.max(insets.bottom, 8) + TAB_CLEARANCE;

  const openCompose = () => {
    if (!requireAuth('Sign in to share a safety warning with sisters.')) return;
    setComposeOpen(true);
  };

  const resetForm = () => {
    setPlace('');
    setWarningType('Harassment');
    setDetail('');
    setTip('');
  };

  const submit = () => {
    const p = place.trim();
    const d = detail.trim();
    if (!p) {
      Alert.alert('Add a place', 'Name the area, street, or spot so sisters know where.');
      return;
    }
    if (!d) {
      Alert.alert('Add details', 'Tell sisters what to watch out for.');
      return;
    }
    dispatch({
      type: 'ADD_WARNING',
      payload: {
        id: `w-${Date.now()}`,
        place: p,
        warningType,
        detail: d,
        tip: tip.trim() || undefined,
        helpfulCount: 0,
        timestamp: Date.now(),
        authorId: state.username,
      } as SafetyWarning,
    });
    hapticSuccess();
    resetForm();
    setComposeOpen(false);
  };

  const onThanks = useCallback(
    (id: string) => {
      if (!requireAuth('Sign in to thank a sister for this warning.')) return;
      hapticSelect();
      dispatch({ type: 'TOGGLE_WARNING_HELPFUL', payload: id });
    },
    [dispatch, requireAuth]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderTitle}>Sister Alerts</Text>
      </View>

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          keyboardShouldPersistTaps="handled"
        >
          {(['All', ...WARNING_TYPES] as const).map((t) => {
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
        keyExtractor={(w) => w.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: fabBottom + 72 },
          list.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="flash-outline" size={44} color={colors.textMeta} />
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySub}>Be the first to help a sister stay safe.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <WarningCard
            warning={item}
            thanked={state.thankedWarningIds.has(item.id)}
            onThanks={() => onThanks(item.id)}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={openCompose}
        accessibilityLabel="Post a warning"
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Warn sisters</Text>
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
              <Text style={styles.composeTitle}>New alert</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.postBtn,
                  !canSubmit && styles.postBtnDisabled,
                  pressed && canSubmit && { opacity: 0.85 },
                ]}
                onPress={submit}
                disabled={!canSubmit}
              >
                <Text style={[styles.postBtnText, !canSubmit && styles.postBtnTextDisabled]}>
                  Share
                </Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.composeBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Place / area</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bole Road near Edna Mall"
                placeholderTextColor={colors.textMeta}
                value={place}
                onChangeText={setPlace}
              />

              <Text style={styles.label}>What kind of problem?</Text>
              <View style={styles.typeGrid}>
                {WARNING_TYPES.map((t) => {
                  const active = warningType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                      onPress={() => setWarningType(t)}
                    >
                      <Ionicons
                        name={TYPE_ICON[t]}
                        size={14}
                        color={active ? colors.danger : colors.textSecondary}
                      />
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>What should sisters know?</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Describe what happened or why this place feels unsafe..."
                placeholderTextColor={colors.textMeta}
                value={detail}
                onChangeText={setDetail}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.label}>Safety tip (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Don't walk alone after 7pm"
                placeholderTextColor={colors.textMeta}
                value={tip}
                onChangeText={setTip}
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
    filterRow: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.full,
      backgroundColor: colors.bgInput,
    },
    filterChipActive: {
      backgroundColor: colors.dangerDim,
    },
    filterChipText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
    },
    filterChipTextActive: {
      color: colors.danger,
      fontWeight: fontWeight.semibold,
    },
    list: {
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    listEmpty: {
      flexGrow: 1,
    },
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
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: 8,
    },
    typePill: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      backgroundColor: colors.dangerDim,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
      maxWidth: '75%' as const,
    },
    typeText: {
      color: colors.danger,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    time: { color: colors.textMeta, fontSize: typography.xs, flexShrink: 0 },
    placeRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
    },
    place: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.base,
      fontWeight: fontWeight.bold,
    },
    detail: {
      color: colors.textPrimary,
      fontSize: typography.sm,
      lineHeight: 20,
    },
    tipBox: {
      flexDirection: 'row' as const,
      gap: 7,
      alignItems: 'flex-start' as const,
      backgroundColor: colors.bgInput,
      borderRadius: radius.sm,
      padding: 10,
    },
    tipText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: typography.xs,
      lineHeight: 17,
    },
    cardFooter: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginTop: 2,
      gap: 8,
    },
    anon: { color: colors.textMeta, fontSize: typography.xs, flexShrink: 1 },
    thanksBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.full,
      backgroundColor: colors.bgInput,
    },
    thanksBtnActive: {
      backgroundColor: colors.upvoteDim,
    },
    thanksText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
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
    emptySub: {
      color: colors.textMeta,
      fontSize: typography.sm,
      textAlign: 'center' as const,
    },
    fab: {
      position: 'absolute' as const,
      right: 16,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      backgroundColor: colors.danger,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: radius.full,
      zIndex: 20,
      ...Platform.select({
        ios: {
          shadowColor: colors.danger,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 6 },
        default: {},
      }),
    },
    fabText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
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
      backgroundColor: colors.danger,
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
      backgroundColor: colors.dangerDim,
    },
    typeChipText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
    },
    typeChipTextActive: {
      color: colors.danger,
      fontWeight: fontWeight.semibold,
    },
  };
}
