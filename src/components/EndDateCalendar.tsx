import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { hapticSelect } from '../utils/haptics';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MAX_DAYS_AHEAD = 60;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
};

export default function EndDateCalendar({ value, onChange, minimumDate }: Props) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();
  const today = useMemo(() => startOfDay(new Date()), []);
  const min = startOfDay(minimumDate ?? today);
  const max = useMemo(() => {
    const m = new Date(today);
    m.setDate(m.getDate() + MAX_DAYS_AHEAD);
    return startOfDay(m);
  }, [today]);

  const [cursor, setCursor] = useState(() => startOfDay(value));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const count = daysInMonth(year, month);
    const list: (Date | null)[] = [];
    for (let i = 0; i < firstDow; i++) list.push(null);
    for (let day = 1; day <= count; day++) {
      list.push(new Date(year, month, day));
    }
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [year, month]);

  const canPrev =
    year > min.getFullYear() ||
    (year === min.getFullYear() && month > min.getMonth());
  const canNext =
    year < max.getFullYear() ||
    (year === max.getFullYear() && month < max.getMonth());

  const shiftMonth = (delta: number) => {
    hapticSelect();
    const next = new Date(year, month + delta, 1);
    setCursor(startOfDay(next));
  };

  const pick = (day: Date) => {
    const d = startOfDay(day);
    if (d < min || d > max) return;
    hapticSelect();
    onChange(d);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => canPrev && shiftMonth(-1)}
          disabled={!canPrev}
          style={[styles.navBtn, !canPrev && styles.navDisabled]}
          hitSlop={8}
          accessibilityLabel="Previous month"
        >
          <Ionicons
            name="chevron-back"
            size={14}
            color={canPrev ? colors.textPrimary : colors.textMeta}
          />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={() => canNext && shiftMonth(1)}
          disabled={!canNext}
          style={[styles.navBtn, !canNext && styles.navDisabled]}
          hitSlop={8}
          accessibilityLabel="Next month"
        >
          <Ionicons
            name="chevron-forward"
            size={14}
            color={canNext ? colors.textPrimary : colors.textMeta}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={`${w}-${i}`} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) {
            return <View key={`e-${i}`} style={styles.cell} />;
          }
          const d = startOfDay(day);
          const disabled = d < min || d > max;
          const selected = sameDay(d, value);
          const isToday = sameDay(d, today);

          return (
            <TouchableOpacity
              key={d.toISOString()}
              style={styles.cell}
              onPress={() => pick(d)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayBubble,
                  isToday && !selected && styles.todayBubble,
                  selected && styles.selectedBubble,
                  disabled && styles.disabledBubble,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && !selected && styles.todayText,
                    selected && styles.selectedText,
                    disabled && styles.disabledText,
                  ]}
                >
                  {d.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return {
    wrap: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: 6,
      paddingTop: 4,
      paddingBottom: 2,
      gap: 1,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 0,
    },
    navBtn: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    navDisabled: { opacity: 0.4 },
    monthLabel: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: 12,
      letterSpacing: -0.2,
    },
    weekRow: {
      flexDirection: 'row' as const,
      marginBottom: 0,
    },
    weekday: {
      flex: 1,
      textAlign: 'center' as const,
      color: colors.textMeta,
      fontSize: 9,
      fontWeight: fontWeight.semibold,
    },
    grid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
    },
    cell: {
      width: '14.28%' as any,
      height: 22,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    dayBubble: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    todayBubble: {
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    selectedBubble: {
      backgroundColor: colors.accent,
    },
    disabledBubble: {},
    dayText: {
      color: colors.textPrimary,
      fontSize: 10,
      fontWeight: fontWeight.medium,
    },
    todayText: {
      color: colors.accent,
      fontWeight: fontWeight.bold,
    },
    selectedText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
    },
    disabledText: {
      color: colors.textMeta,
      opacity: 0.45,
    },
  };
}
