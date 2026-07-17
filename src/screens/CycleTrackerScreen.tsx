import React, { useMemo } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCycle } from '../store/cycle';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function CycleTrackerScreen(_props: any) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();
  const {
    data,
    snapshot,
    markPeriodStartedToday,
    setLastPeriodStart,
    setCycleLength,
    setPeriodLength,
    clearCycle,
  } = useCycle();

  const status = useMemo(() => {
    if (!data.lastPeriodStart) return 'Tap below when your period starts.';
    if (snapshot.phase === 'period') return `Period · day ${snapshot.dayInCycle}`;
    if (snapshot.daysUntilNext === 1) return 'Next period tomorrow';
    return `Next period in ${snapshot.daysUntilNext} days`;
  }, [data.lastPeriodStart, snapshot]);

  const shiftStart = (days: number) => {
    const base = data.lastPeriodStart ?? Date.now();
    setLastPeriodStart(base + days * 86_400_000);
  };

  const onClear = () => {
    Alert.alert('Reset?', 'Clears cycle data on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: clearCycle },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cycle</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.hero}>
          <Text style={styles.phase}>{snapshot.phaseLabel}</Text>
          <Text style={styles.day}>
            {snapshot.dayInCycle != null ? `Day ${snapshot.dayInCycle}` : '—'}
          </Text>
          <Text style={styles.status}>{status}</Text>
          {snapshot.nextPeriodDate != null && (
            <Text style={styles.next}>Next · {formatDate(snapshot.nextPeriodDate)}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={markPeriodStartedToday}
          activeOpacity={0.9}
        >
          <Ionicons name="water" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Period started today</Text>
        </TouchableOpacity>

        {data.lastPeriodStart != null && (
          <View style={styles.adjustRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => shiftStart(-1)}>
              <Text style={styles.adjustText}>−1 day</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => shiftStart(1)}>
              <Text style={styles.adjustText}>+1 day</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Cycle</Text>
            <View style={styles.statControls}>
              <TouchableOpacity
                onPress={() => setCycleLength(data.cycleLength - 1)}
                disabled={data.cycleLength <= 21}
                hitSlop={8}
              >
                <Ionicons
                  name="remove-circle"
                  size={26}
                  color={data.cycleLength <= 21 ? colors.border : colors.accent}
                />
              </TouchableOpacity>
              <Text style={styles.statValue}>{data.cycleLength}d</Text>
              <TouchableOpacity
                onPress={() => setCycleLength(data.cycleLength + 1)}
                disabled={data.cycleLength >= 45}
                hitSlop={8}
              >
                <Ionicons
                  name="add-circle"
                  size={26}
                  color={data.cycleLength >= 45 ? colors.border : colors.accent}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>Flow</Text>
            <View style={styles.statControls}>
              <TouchableOpacity
                onPress={() => setPeriodLength(data.periodLength - 1)}
                disabled={data.periodLength <= 2}
                hitSlop={8}
              >
                <Ionicons
                  name="remove-circle"
                  size={26}
                  color={data.periodLength <= 2 ? colors.border : colors.accent}
                />
              </TouchableOpacity>
              <Text style={styles.statValue}>{data.periodLength}d</Text>
              <TouchableOpacity
                onPress={() => setPeriodLength(data.periodLength + 1)}
                disabled={data.periodLength >= 10}
                hitSlop={8}
              >
                <Ionicons
                  name="add-circle"
                  size={26}
                  color={data.periodLength >= 10 ? colors.border : colors.accent}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {data.lastPeriodStart != null && (
          <TouchableOpacity onPress={onClear} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
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
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 100,
      justifyContent: 'center' as const,
      gap: 14,
    },
    hero: {
      alignItems: 'center' as const,
      gap: 6,
      paddingVertical: 8,
    },
    phase: {
      color: colors.accent,
      fontSize: typography.xs,
      fontWeight: fontWeight.bold,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
    day: {
      color: colors.textPrimary,
      fontSize: 42,
      fontWeight: fontWeight.extrabold,
      letterSpacing: -1,
    },
    status: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      textAlign: 'center' as const,
    },
    next: {
      color: colors.textMeta,
      fontSize: typography.xs,
      marginTop: 2,
    },
    primaryBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      backgroundColor: '#e11d48',
      paddingVertical: 15,
      borderRadius: radius.full,
    },
    primaryBtnText: {
      color: '#fff',
      fontSize: typography.sm,
      fontWeight: fontWeight.bold,
    },
    adjustRow: {
      flexDirection: 'row' as const,
      gap: 10,
    },
    adjustBtn: {
      flex: 1,
      alignItems: 'center' as const,
      paddingVertical: 10,
      borderRadius: radius.full,
      backgroundColor: colors.bgInput,
    },
    adjustText: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    row: {
      flexDirection: 'row' as const,
      gap: 10,
    },
    stat: {
      flex: 1,
      backgroundColor: colors.bgInput,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: 'center' as const,
      gap: 8,
    },
    statLabel: {
      color: colors.textMeta,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    statControls: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    statValue: {
      color: colors.textPrimary,
      fontSize: typography.lg,
      fontWeight: fontWeight.bold,
      minWidth: 36,
      textAlign: 'center' as const,
    },
    resetBtn: {
      alignItems: 'center' as const,
      paddingTop: 4,
    },
    resetText: {
      color: colors.textMeta,
      fontSize: typography.xs,
    },
  };
}
