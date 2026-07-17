import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAuthGate } from '../components/AuthGate';
import { resolveDistressLocation } from '../utils/distressLocation';
import { DistressSignal } from '../types';
import { typography, fontWeight, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { hapticLight, hapticSelect, hapticSuccess } from '../utils/haptics';

const HOLD_MS = 1500;

const MOCK_RESPONSES = [
  { label: 'Sister nearby', message: 'I got your signal.' },
  { label: 'Sister 0.4 km', message: 'On my way — stay safe.' },
];

export default function SosScreen() {
  const styles = useThemedStyles(makeStyles);
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();

  const [sending, setSending] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const myActive = state.distressSignals.find((d) => d.isMine && d.status === 'active');

  useEffect(() => {
    if (!myActive) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [myActive, pulse]);

  const clearHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    animRef.current?.stop();
    progress.setValue(0);
  }, [progress]);

  const sendDistress = useCallback(async () => {
    clearHold();
    if (!requireAuth('Sign in so nearby sisters can get your SOS.')) return;
    if (myActive || sending) return;

    setSending(true);
    hapticSuccess();
    const loc = await resolveDistressLocation();
    const signal: DistressSignal = {
      id: `d-${Date.now()}`,
      status: 'active',
      placeLabel: loc.placeLabel,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timestamp: Date.now(),
      authorId: state.username,
      isMine: true,
      notifiedCount: 4 + Math.floor(Math.random() * 8),
      responders: [],
    };
    dispatch({ type: 'ADD_DISTRESS', payload: signal });
    setSending(false);

    MOCK_RESPONSES.forEach((r, i) => {
      setTimeout(() => {
        dispatch({
          type: 'ADD_DISTRESS_RESPONDER',
          payload: {
            distressId: signal.id,
            responder: {
              id: `resp-${signal.id}-${i}`,
              label: r.label,
              message: r.message,
              timestamp: Date.now(),
            },
          },
        });
      }, 2000 + i * 3000);
    });
  }, [clearHold, requireAuth, myActive, sending, state.username, dispatch]);

  const startHold = useCallback(() => {
    if (myActive || sending) return;
    if (!requireAuth('Sign in to send SOS.')) return;
    hapticLight();
    progress.setValue(0);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    });
    animRef.current.start();
    holdTimer.current = setTimeout(() => sendDistress(), HOLD_MS);
  }, [myActive, sending, requireAuth, progress, sendDistress]);

  const markSafe = useCallback(() => {
    if (!myActive) return;
    hapticSelect();
    dispatch({ type: 'RESOLVE_DISTRESS', payload: myActive.id });
  }, [myActive, dispatch]);

  const ringScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>SOS</Text>
      </View>

      <View style={styles.body}>
        <Animated.View style={{ transform: [{ scale: myActive ? pulse : ringScale }] }}>
          <Pressable
            onPressIn={myActive ? undefined : startHold}
            onPressOut={myActive ? undefined : clearHold}
            onPress={myActive ? markSafe : undefined}
            style={({ pressed }) => [
              styles.sosBtn,
              myActive && styles.sosBtnSafe,
              pressed && !myActive && styles.sosBtnHolding,
            ]}
            accessibilityLabel={myActive ? "I'm safe" : 'Hold for SOS'}
          >
            <Ionicons name={myActive ? 'checkmark' : 'alert'} size={48} color="#fff" />
            <Text style={styles.sosLabel}>{myActive ? "I'm safe" : 'SOS'}</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.hint}>
          {myActive
            ? `${myActive.notifiedCount} sisters alerted · tap when safe`
            : 'Hold 1.5s to alert nearby sisters'}
        </Text>

        {myActive && (
          <Text style={styles.place} numberOfLines={1}>
            {myActive.placeLabel}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      paddingVertical: 12,
      alignItems: 'center' as const,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderSubtle,
    },
    title: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    body: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 24,
      paddingBottom: 100,
      gap: 18,
    },
    sosBtn: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#dc2626',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 6,
      ...Platform.select({
        ios: {
          shadowColor: '#dc2626',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
        },
        android: { elevation: 8 },
        default: {},
      }),
    },
    sosBtnHolding: {
      backgroundColor: '#b91c1c',
    },
    sosBtnSafe: {
      backgroundColor: '#059669',
      ...Platform.select({
        ios: { shadowColor: '#059669' },
        default: {},
      }),
    },
    sosLabel: {
      color: '#fff',
      fontWeight: fontWeight.extrabold,
      fontSize: typography.base,
      letterSpacing: 1,
    },
    hint: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      textAlign: 'center' as const,
    },
    place: {
      color: colors.textMeta,
      fontSize: typography.xs,
      textAlign: 'center' as const,
    },
  };
}
