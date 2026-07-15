import React from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import {
  SettingsCard,
  SettingsDivider,
  SettingsHeader,
  SettingsLink,
} from '../components/SettingsUI';

export default function AboutScreen({ navigation }: any) {
  const styles = useThemedStyles(makeAboutStyles);
  const colors = useColors();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <SettingsHeader title="About" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="chatbubbles" size={32} color={colors.accent} />
          </View>
          <Text style={styles.name}>etete</Text>
          <Text style={styles.tagline}>
            A safe space for men and boys to share what they've been holding inside.
          </Text>
          <View style={styles.versionPill}>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        <View style={styles.points}>
          <Text style={styles.point}>Anonymous sharing, no judgment</Text>
          <Text style={styles.point}>Brotherhood built on respect</Text>
          <Text style={styles.point}>Your privacy stays yours</Text>
        </View>

        <SettingsCard>
          <SettingsLink
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() =>
              Alert.alert(
                'Terms of Service',
                'By using etete you agree to post respectfully and protect others privacy.'
              )
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
        </SettingsCard>

        <Text style={styles.footer}>Made for honest conversations.</Text>
      </View>
    </SafeAreaView>
  );
}

function makeAboutStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    body: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      justifyContent: 'space-between' as const,
    },
    hero: {
      alignItems: 'center' as const,
      gap: 10,
      paddingTop: 12,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: colors.accentDim,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
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
      textAlign: 'center' as const,
      lineHeight: 21,
      paddingHorizontal: 20,
    },
    versionPill: {
      marginTop: 4,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    version: {
      color: colors.textMeta,
      fontSize: typography.xs,
      fontWeight: fontWeight.medium,
    },
    points: {
      gap: 8,
      paddingHorizontal: 8,
      alignItems: 'center' as const,
    },
    point: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    footer: {
      color: colors.textMeta,
      fontSize: typography.xs,
      textAlign: 'center' as const,
      paddingBottom: 4,
    },
  };
}
