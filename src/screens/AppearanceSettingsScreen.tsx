import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrefs } from '../store/preferences';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { SettingsHeader, SettingsSection } from '../components/SettingsUI';
import { hapticSelect } from '../utils/haptics';

export default function AppearanceSettingsScreen({ navigation }: any) {
  const { prefs, setPref } = usePrefs();
  const colors = useColors();
  const styles = useThemedStyles(makeAppearanceStyles);
  const mode = prefs.themeMode;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Theme/Language" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      >
        <Text style={styles.intro}>
          Choose how ehete looks and which language you prefer.
        </Text>

        <SettingsSection title="Theme" />
        <View style={styles.options}>
          <Pressable
            style={[styles.option, mode === 'dark' && styles.optionActive]}
            onPress={() => {
              if (mode === 'dark') return;
              hapticSelect();
              setPref('themeMode', 'dark');
            }}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="moon"
                size={22}
                color={mode === 'dark' ? colors.accent : colors.textSecondary}
              />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Dark mode</Text>
              <Text style={styles.optionSub}>
                Pitch black background, easier on the eyes at night
              </Text>
            </View>
            {mode === 'dark' && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            )}
          </Pressable>

          <Pressable
            style={[styles.option, mode === 'light' && styles.optionActive]}
            onPress={() => {
              if (mode === 'light') return;
              hapticSelect();
              setPref('themeMode', 'light');
            }}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="sunny"
                size={22}
                color={mode === 'light' ? colors.accent : colors.textSecondary}
              />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Light mode</Text>
              <Text style={styles.optionSub}>
                White background for bright daytime reading
              </Text>
            </View>
            {mode === 'light' && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            )}
          </Pressable>
        </View>

        <SettingsSection title="Language preference" />
        <View style={styles.options}>
          {(
            [
              { id: 'en' as const, title: 'English', sub: 'App language in English' },
              { id: 'am' as const, title: 'አማርኛ', sub: 'Amharic language preference' },
              { id: 'om' as const, title: 'Oromo', sub: 'Oromo language preference' },
            ] as const
          ).map((lang) => {
            const active = prefs.language === lang.id;
            return (
              <Pressable
                key={lang.id}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => {
                  if (active) return;
                  hapticSelect();
                  setPref('language', lang.id);
                }}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="language"
                    size={22}
                    color={active ? colors.accent : colors.textSecondary}
                  />
                </View>
                <View style={styles.optionBody}>
                  <Text style={styles.optionTitle}>{lang.title}</Text>
                  <Text style={styles.optionSub}>{lang.sub}</Text>
                </View>
                {active && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeAppearanceStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: 16, paddingBottom: 40 },
    intro: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      lineHeight: 20,
      marginBottom: 8,
    },
    options: { gap: 12 },
    option: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 14,
      padding: 16,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    optionActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentDim,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.bgInput,
    },
    optionBody: { flex: 1, gap: 2 },
    optionTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    optionSub: {
      color: colors.textSecondary,
      fontSize: typography.xs,
      lineHeight: 16,
    },
  };
}
