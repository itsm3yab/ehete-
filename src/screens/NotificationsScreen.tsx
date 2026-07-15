import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, typography, fontWeight, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { usePrefs } from '../store/preferences';

export default function NotificationsScreen() {
  const styles = useThemedStyles(makeNotifStyles);
  const colors = useColors();
  const { prefs } = usePrefs();

  const enabled = useMemo(() => {
    const list: string[] = [];
    if (prefs.notifyReplies) list.push('replies');
    if (prefs.notifyVotes) list.push('votes');
    if (prefs.notifyMentions) list.push('mentions');
    if (prefs.notifyAnnouncements) list.push('announcements');
    return list;
  }, [prefs]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <View style={styles.empty}>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications-outline" size={36} color={colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>All caught up</Text>
        <Text style={styles.emptyText}>
          {enabled.length === 0
            ? 'All notification types are off. Turn some on in the side menu → Notifications.'
            : `Watching for ${enabled.join(', ')}. You'll see them here when something happens.`}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function makeNotifStyles(colors: ColorPalette) {
  return {
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: fontWeight.extrabold,
    fontSize: typography.xl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    lineHeight: 22,
  },
  };
}
