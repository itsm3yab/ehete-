import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePrefs } from '../store/preferences';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import {
  SettingsCard,
  SettingsDivider,
  SettingsHeader,
  SettingsLink,
  SettingsSection,
  SettingsToggle,
} from '../components/SettingsUI';

const BLOCKED_KEY = 'ehete_blocked_v1';

export default function PrivacySettingsScreen({ navigation }: any) {
  const styles = useThemedStyles(makePrivacyStyles);
  const { prefs, setPref } = usePrefs();
  const colors = useColors();
  const [blocked, setBlocked] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BLOCKED_KEY);
        if (raw) setBlocked(JSON.parse(raw));
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const saveBlocked = async (next: string[]) => {
    setBlocked(next);
    await AsyncStorage.setItem(BLOCKED_KEY, JSON.stringify(next));
  };

  const addBlocked = () => {
    const name = username.trim().replace(/^@/, '');
    if (!name) return;
    if (blocked.includes(name.toLowerCase())) {
      Alert.alert('Already blocked', `@${name} is already on your list.`);
      return;
    }
    saveBlocked([...blocked, name.toLowerCase()]);
    setUsername('');
  };

  const removeBlocked = (name: string) => {
    Alert.alert('Unblock user?', `Allow @${name} to interact with you again.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        style: 'destructive',
        onPress: () => saveBlocked(blocked.filter((b) => b !== name)),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <SettingsHeader title="Privacy & Safety" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingsSection title="Screen privacy" />
        <SettingsCard>
          <SettingsToggle
            icon="phone-portrait-outline"
            label="Block screenshots & recording"
            description="Hides the app from screenshots, screen recording, and the recent-apps preview"
            value={prefs.preventScreenshots}
            onValueChange={(v) => setPref('preventScreenshots', v)}
          />
        </SettingsCard>

        <SettingsSection title="Visibility" />
        <SettingsCard>
          <SettingsToggle
            icon="eye-off-outline"
            label="Private profile"
            description="Hide your activity summary from others"
            value={prefs.privateProfile}
            onValueChange={(v) => setPref('privateProfile', v)}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="radio-outline"
            label="Hide online status"
            description="Don't show when you're active"
            value={prefs.hideOnlineStatus}
            onValueChange={(v) => setPref('hideOnlineStatus', v)}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="chatbubbles-outline"
            label="Allow anonymous replies"
            description="Let guests-style anonymous users reply to you"
            value={prefs.allowAnonymousReplies}
            onValueChange={(v) => setPref('allowAnonymousReplies', v)}
          />
        </SettingsCard>

        <SettingsSection title="Blocked users" />
        <SettingsCard>
          <View style={styles.blockInputRow}>
            <TextInput
              style={[styles.blockInput, { backgroundColor: colors.bgInput, color: colors.textPrimary }]}
              placeholder="@username"
              placeholderTextColor={colors.textMeta}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={[styles.blockBtn, { backgroundColor: colors.accent }]} onPress={addBlocked}>
              <Text style={styles.blockBtnText}>Block</Text>
            </TouchableOpacity>
          </View>
        </SettingsCard>

        {loaded && blocked.length === 0 && (
          <Text style={[styles.empty, { color: colors.textMeta }]}>No blocked users yet.</Text>
        )}

        {blocked.length > 0 && (
          <SettingsCard>
            {blocked.map((name, i) => (
              <React.Fragment key={name}>
                {i > 0 && <SettingsDivider />}
                <SettingsLink
                  icon="person-remove-outline"
                  label={`@${name}`}
                  description="Tap to unblock"
                  onPress={() => removeBlocked(name)}
                  destructive
                />
              </React.Fragment>
            ))}
          </SettingsCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



function makePrivacyStyles(colors: ColorPalette) {
  return {
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40, gap: 0 },
  blockInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  blockInput: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.sm,
  },
  blockBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  blockBtnText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: typography.sm,
  },
  empty: {
    fontSize: typography.sm,
    marginTop: 12,
    marginLeft: 4,
  },
};
}
