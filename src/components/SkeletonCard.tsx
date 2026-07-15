import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useColors, ColorPalette } from '../store/theme';

function ShimmerBox({ style, color }: { style?: object; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return <Animated.View style={[style, { opacity, backgroundColor: color }]} />;
}

export default function SkeletonCard() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const s = colors.skeleton;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ShimmerBox style={styles.avatar} color={s} />
        <View style={styles.col}>
          <View style={styles.headerRow}>
            <ShimmerBox style={styles.badge} color={s} />
            <ShimmerBox style={styles.metaLine} color={s} />
          </View>
          <ShimmerBox style={[styles.line, { width: '80%', marginTop: 8 }]} color={s} />
          <ShimmerBox style={[styles.line, { width: '100%', marginTop: 6 }]} color={s} />
          <ShimmerBox style={[styles.line, { width: '90%', marginTop: 5 }]} color={s} />
          <ShimmerBox style={[styles.line, { width: '65%', marginTop: 5 }]} color={s} />
          <View style={styles.actions}>
            {[44, 36, 44, 32, 20, 20].map((w, i) => (
              <ShimmerBox key={i} style={[styles.actionBox, { width: w }]} color={s} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export function SkeletonReply() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const s = colors.skeleton;

  return (
    <View style={styles.replyCard}>
      <ShimmerBox style={styles.replyAvatar} color={s} />
      <View style={styles.col}>
        <ShimmerBox style={[styles.line, { width: '40%' }]} color={s} />
        <ShimmerBox style={[styles.line, { width: '95%', marginTop: 5 }]} color={s} />
        <ShimmerBox style={[styles.line, { width: '70%', marginTop: 5 }]} color={s} />
      </View>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    row: { flexDirection: 'row', gap: 12 },
    avatar: { width: 42, height: 42, borderRadius: 21, flexShrink: 0 },
    col: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    badge: { width: 72, height: 14, borderRadius: 7 },
    metaLine: { width: 100, height: 11, borderRadius: 6 },
    line: { height: 12, borderRadius: 6 },
    actions: { flexDirection: 'row', gap: 16, marginTop: 14, alignItems: 'center' },
    actionBox: { height: 12, borderRadius: 6 },
    replyCard: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      backgroundColor: colors.bg,
    },
    replyAvatar: { width: 32, height: 32, borderRadius: 16, flexShrink: 0 },
  });
}
