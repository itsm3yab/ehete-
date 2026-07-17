import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrefs } from '../store/preferences';
import { useColors, typography, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import {
  SettingsCard,
  SettingsDivider,
  SettingsHeader,
  SettingsSection,
  SettingsToggle,
} from '../components/SettingsUI';

export default function NotificationsSettingsScreen({ navigation }: any) {
  const styles = useThemedStyles(makeNotifSettingsStyles);
  const { prefs, setPref } = usePrefs();
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <SettingsHeader title="Notifications" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Choose what you want to hear about. These preferences are saved on this device.
        </Text>

        <SettingsSection title="Activity" />
        <SettingsCard>
          <SettingsToggle
            icon="chatbubble-outline"
            label="Replies"
            description="When someone replies to your confession"
            value={prefs.notifyReplies}
            onValueChange={(v) => setPref('notifyReplies', v)}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="arrow-up-circle-outline"
            label="Votes"
            description="When your posts get upvotes"
            value={prefs.notifyVotes}
            onValueChange={(v) => setPref('notifyVotes', v)}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="at-outline"
            label="Mentions"
            description="When someone mentions you in a reply"
            value={prefs.notifyMentions}
            onValueChange={(v) => setPref('notifyMentions', v)}
          />
        </SettingsCard>

        <SettingsSection title="Product" />
        <SettingsCard>
          <SettingsToggle
            icon="megaphone-outline"
            label="Announcements"
            description="News and feature updates from ehete"
            value={prefs.notifyAnnouncements}
            onValueChange={(v) => setPref('notifyAnnouncements', v)}
          />
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}



function makeNotifSettingsStyles(colors: ColorPalette) {
  return {
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  intro: {
    fontSize: typography.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
};
}
