import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAuthGate } from './AuthGate';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { hapticSuccess } from '../utils/haptics';
import { timeAgo } from './utils';

/** Overlay banners only — SOS button lives in the bottom tab */
export default function DistressBanners() {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();

  const myActive = state.distressSignals.find((d) => d.isMine && d.status === 'active');
  const nearbyActive = state.distressSignals.filter(
    (d) =>
      !d.isMine &&
      d.status === 'active' &&
      !state.dismissedDistressIds.has(d.id)
  );

  const markSafe = useCallback(() => {
    if (!myActive) return;
    dispatch({ type: 'RESOLVE_DISTRESS', payload: myActive.id });
  }, [myActive, dispatch]);

  const respondNearby = useCallback(
    (id: string) => {
      if (!requireAuth('Sign in to respond to a sister in distress.')) return;
      hapticSuccess();
      dispatch({
        type: 'ADD_DISTRESS_RESPONDER',
        payload: {
          distressId: id,
          responder: {
            id: `me-${Date.now()}`,
            label: state.username ? `@${state.username}` : 'You',
            message: "I'm nearby and I see your alert. Stay strong.",
            timestamp: Date.now(),
          },
        },
      });
    },
    [dispatch, requireAuth, state.username]
  );

  if (!myActive && nearbyActive.length === 0) return null;

  return (
    <>
      {myActive && (
        <View style={[styles.liveBanner, { top: insets.top + 6 }]} pointerEvents="box-none">
          <View style={styles.liveInner}>
            <View style={styles.liveDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.liveTitle}>Distress active</Text>
              <Text style={styles.liveSub} numberOfLines={1}>
                {myActive.notifiedCount} sisters alerted · {myActive.placeLabel}
              </Text>
            </View>
            <TouchableOpacity style={styles.safeBtn} onPress={markSafe}>
              <Text style={styles.safeBtnText}>Safe</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {nearbyActive.length > 0 && !myActive && (
        <View style={[styles.incomingWrap, { top: insets.top + 6 }]}>
          {nearbyActive.slice(0, 1).map((d) => (
            <View key={d.id} style={styles.incomingCard}>
              <View style={styles.incomingTop}>
                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                <Text style={styles.incomingTitle}>Sister in distress nearby</Text>
              </View>
              <Text style={styles.incomingPlace}>{d.placeLabel}</Text>
              <Text style={styles.incomingMeta}>
                Sent {timeAgo(d.timestamp)} · {d.notifiedCount} notified
              </Text>
              <View style={styles.incomingActions}>
                <TouchableOpacity style={styles.helpBtn} onPress={() => respondNearby(d.id)}>
                  <Text style={styles.helpBtnText}>I'm nearby — help</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dispatch({ type: 'DISMISS_DISTRESS_VIEW', payload: d.id })}
                >
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function makeStyles(colors: ColorPalette) {
  return {
    liveBanner: {
      position: 'absolute' as const,
      left: 12,
      right: 12,
      zIndex: 50,
    },
    liveInner: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      backgroundColor: '#7f1d1d',
      borderRadius: radius.md,
      padding: 12,
      borderWidth: 1,
      borderColor: '#fecaca55',
    },
    liveDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#fca5a5',
    },
    liveTitle: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
    liveSub: {
      color: '#fecaca',
      fontSize: typography.xs,
      marginTop: 2,
    },
    safeBtn: {
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.full,
    },
    safeBtnText: {
      color: '#059669',
      fontWeight: fontWeight.bold,
      fontSize: typography.xs,
    },
    incomingWrap: {
      position: 'absolute' as const,
      left: 12,
      right: 12,
      zIndex: 45,
    },
    incomingCard: {
      backgroundColor: colors.dangerDim,
      borderRadius: radius.md,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.danger + '55',
      gap: 6,
    },
    incomingTop: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    incomingTitle: {
      color: colors.danger,
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
    incomingPlace: {
      color: colors.textPrimary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.sm,
    },
    incomingMeta: {
      color: colors.textSecondary,
      fontSize: typography.xs,
    },
    incomingActions: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 14,
      marginTop: 6,
    },
    helpBtn: {
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
    dismissText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
    },
  };
}
