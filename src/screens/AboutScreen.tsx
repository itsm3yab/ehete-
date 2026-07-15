import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import {
  SettingsCard,
  SettingsDivider,
  SettingsHeader,
  SettingsLink,
  SettingsSection,
} from '../components/SettingsUI';

export default function AboutScreen({ navigation }: any) {
  const styles = useThemedStyles(makeAboutStyles);
  const colors = useColors();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="About Etete" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="chatbubbles" size={28} color={colors.accent} />
          </View>
          <Text style={styles.name}>etete</Text>
          <Text style={styles.tagline}>A safe space to share what you've been holding inside.</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <SettingsSection title="Links" />
        <SettingsCard>
          <SettingsLink
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() =>
              Alert.alert('Terms of Service', 'By using etete you agree to post respectfully and protect others’ privacy.')
            }
          />
          <SettingsDivider />
          <SettingsLink
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() =>
              Alert.alert(
                'Privacy Policy',
                'We keep your confessions anonymous by default. Preferences stay on this device unless you sign in.'
              )
            }
          />
          <SettingsDivider />
          <SettingsLink
            icon="logo-github"
            label="Open source"
            description="github.com/itsm3yab/etete"
            onPress={() => Linking.openURL('https://github.com/itsm3yab/etete')}
          />
        </SettingsCard>

        <SettingsSection title="Credits" />
        <SettingsCard>
          <SettingsLink
            icon="code-slash-outline"
            label="Built with Expo"
            description="React Native + TypeScript"
            onPress={() => Linking.openURL('https://expo.dev')}
          />
        </SettingsCard>

        <Text style={styles.footer}>Made for honest conversations.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeAboutStyles(colors: ColorPalette) {
  return {
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.xxl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  version: {
    color: colors.textMeta,
    fontSize: typography.xs,
    marginTop: 4,
  },
  footer: {
    color: colors.textMeta,
    fontSize: typography.xs,
    textAlign: 'center',
    marginTop: 28,
  },
  };
}
