import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../store/theme';

function ShimmerBox({ style }: { style?: object }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return <Animated.View style={[style, { opacity }]} />;
}

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ShimmerBox style={styles.avatar} />
        <View style={styles.col}>
          {/* Header line */}
          <View style={styles.headerRow}>
            <ShimmerBox style={styles.badge} />
            <ShimmerBox style={styles.metaLine} />
          </View>
          {/* Title */}
          <ShimmerBox style={[styles.line, { width: '80%', marginTop: 8 }]} />
          {/* Body lines */}
          <ShimmerBox style={[styles.line, { width: '100%', marginTop: 6 }]} />
          <ShimmerBox style={[styles.line, { width: '90%', marginTop: 5 }]} />
          <ShimmerBox style={[styles.line, { width: '65%', marginTop: 5 }]} />
          {/* Actions */}
          <View style={styles.actions}>
            {[44, 36, 44, 32, 20, 20].map((w, i) => (
              <ShimmerBox key={i} style={[styles.actionBox, { width: w }]} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export function SkeletonReply() {
  return (
    <View style={styles.replyCard}>
      <ShimmerBox style={styles.replyAvatar} />
      <View style={styles.col}>
        <ShimmerBox style={[styles.line, { width: '40%' }]} />
        <ShimmerBox style={[styles.line, { width: '95%', marginTop: 5 }]} />
        <ShimmerBox style={[styles.line, { width: '70%', marginTop: 5 }]} />
      </View>
    </View>
  );
}

const S = colors.skeleton;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: { flexDirection: 'row', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: S, flexShrink: 0 },
  col: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { width: 72, height: 14, borderRadius: 7, backgroundColor: S },
  metaLine: { width: 100, height: 11, borderRadius: 6, backgroundColor: S },
  line: { height: 12, borderRadius: 6, backgroundColor: S },
  actions: { flexDirection: 'row', gap: 16, marginTop: 14, alignItems: 'center' },
  actionBox: { height: 12, borderRadius: 6, backgroundColor: S },
  replyCard: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  replyAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: S, flexShrink: 0 },
});
