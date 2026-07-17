import React, { useMemo } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAuthGate } from '../components/AuthGate';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { SettingsHeader } from '../components/SettingsUI';
import { timeAgo } from '../components/utils';
import { hapticSelect, hapticSuccess } from '../utils/haptics';
import type { DistressSignal } from '../types';

export default function NotificationsScreen({ navigation }: any) {
  const styles = useThemedStyles(makeNotifStyles);
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();

  const signals = useMemo(
    () =>
      [...state.distressSignals].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return b.timestamp - a.timestamp;
      }),
    [state.distressSignals]
  );

  const respond = (d: DistressSignal) => {
    if (!requireAuth('Sign in to respond to a sister in distress.')) return;
    hapticSuccess();
    dispatch({
      type: 'ADD_DISTRESS_RESPONDER',
      payload: {
        distressId: d.id,
        responder: {
          id: `me-${Date.now()}`,
          label: state.username ? `@${state.username}` : 'You',
          message: "I'm nearby and I see your alert. Stay strong.",
          timestamp: Date.now(),
        },
      },
    });
  };

  const resolve = (id: string) => {
    hapticSelect();
    dispatch({ type: 'RESOLVE_DISTRESS', payload: id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Alerts" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>Distress signals from sisters nearby</Text>

      <FlatList
        data={signals}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark-outline" size={36} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No distress signals</Text>
            <Text style={styles.emptyText}>
              If a sister holds SOS, nearby active users will see it here. Hold the red SOS button
              when you need help.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const active = item.status === 'active';
          return (
            <View style={[styles.card, active && styles.cardActive]}>
              <View style={styles.cardTop}>
                <View style={[styles.badge, !active && styles.badgeResolved]}>
                  <Ionicons
                    name={active ? 'radio' : 'checkmark-circle'}
                    size={13}
                    color={active ? '#fff' : colors.success}
                  />
                  <Text style={[styles.badgeText, !active && { color: colors.success }]}>
                    {active ? (item.isMine ? 'Your SOS' : 'Nearby SOS') : 'Resolved'}
                  </Text>
                </View>
                <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
              </View>

              <Text style={styles.place}>{item.placeLabel}</Text>
              <Text style={styles.meta}>
                {item.notifiedCount} sisters notified
                {item.responders.length > 0
                  ? ` · ${item.responders.length} responding`
                  : ''}
              </Text>

              {item.responders.slice(-2).map((r) => (
                <View key={r.id} style={styles.respRow}>
                  <Ionicons name="heart" size={12} color={colors.upvote} />
                  <Text style={styles.respText} numberOfLines={2}>
                    <Text style={styles.respName}>{r.label}: </Text>
                    {r.message}
                  </Text>
                </View>
              ))}

              {active && item.isMine && (
                <TouchableOpacity style={styles.safeBtn} onPress={() => resolve(item.id)}>
                  <Text style={styles.safeBtnText}>I'm safe now</Text>
                </TouchableOpacity>
              )}
              {active && !item.isMine && (
                <TouchableOpacity style={styles.helpBtn} onPress={() => respond(item)}>
                  <Text style={styles.helpBtnText}>I'm nearby — help</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function makeNotifStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      paddingHorizontal: 16,
      paddingBottom: 8,
      marginTop: -4,
    },
    list: { padding: 16, gap: 12, paddingBottom: 120 },
    card: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.md,
      padding: 14,
      borderWidth: 0.5,
      borderColor: colors.border,
      gap: 8,
    },
    cardActive: {
      borderColor: colors.danger + '66',
      backgroundColor: colors.dangerDim,
    },
    cardTop: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    badge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      backgroundColor: colors.danger,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    badgeResolved: {
      backgroundColor: colors.successDim,
    },
    badgeText: {
      color: '#fff',
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    time: { color: colors.textMeta, fontSize: typography.xs },
    place: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    meta: {
      color: colors.textSecondary,
      fontSize: typography.xs,
    },
    respRow: {
      flexDirection: 'row' as const,
      gap: 6,
      alignItems: 'flex-start' as const,
    },
    respText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: typography.xs,
      lineHeight: 17,
    },
    respName: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
    safeBtn: {
      marginTop: 4,
      alignSelf: 'flex-start' as const,
      backgroundColor: colors.success,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radius.full,
    },
    safeBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.xs,
    },
    helpBtn: {
      marginTop: 4,
      alignSelf: 'flex-start' as const,
      backgroundColor: colors.danger,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radius.full,
    },
    helpBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.xs,
    },
    empty: {
      alignItems: 'center' as const,
      paddingTop: 80,
      paddingHorizontal: 28,
      gap: 12,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.bgElevated,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: 4,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.lg,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      textAlign: 'center' as const,
      lineHeight: 22,
    },
  };
}
