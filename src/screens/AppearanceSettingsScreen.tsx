import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrefs } from '../store/preferences';
import { useColors, typography, fontWeight, radius } from '../store/theme';
import { SettingsHeader, SettingsSection } from '../components/SettingsUI';

export default function AppearanceSettingsScreen({ navigation }: any) {
  const { prefs, setPref } = usePrefs();
  const colors = useColors();
  const mode = prefs.themeMode;

  const styles = StyleSheet.create({
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
      flexDirection: 'row',
      alignItems: 'center',
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
      alignItems: 'center',
      justifyContent: 'center',
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
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Appearance" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose how etete looks on your device.</Text>

        <SettingsSection title="Theme" />
        <View style={styles.options}>
          <Pressable
            style={[styles.option, mode === 'dark' && styles.optionActive]}
            onPress={() => setPref('themeMode', 'dark')}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="moon" size={22} color={mode === 'dark' ? colors.accent : colors.textSecondary} />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Dark mode</Text>
              <Text style={styles.optionSub}>Pitch black background, easier on the eyes at night</Text>
            </View>
            {mode === 'dark' && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
          </Pressable>

          <Pressable
            style={[styles.option, mode === 'light' && styles.optionActive]}
            onPress={() => setPref('themeMode', 'light')}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="sunny" size={22} color={mode === 'light' ? colors.accent : colors.textSecondary} />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Light mode</Text>
              <Text style={styles.optionSub}>White background for bright daytime reading</Text>
            </View>
            {mode === 'light' && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
          </Pressable>
        </View>

        <SettingsSection title="Language" />
        <View style={styles.options}>
          <Pressable
            style={[styles.option, prefs.language === 'en' && styles.optionActive]}
            onPress={() => setPref('language', 'en')}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="language"
                size={22}
                color={prefs.language === 'en' ? colors.accent : colors.textSecondary}
              />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>English</Text>
              <Text style={styles.optionSub}>App language in English</Text>
            </View>
            {prefs.language === 'en' && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            )}
          </Pressable>

          <Pressable
            style={[styles.option, prefs.language === 'am' && styles.optionActive]}
            onPress={() => setPref('language', 'am')}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="language"
                size={22}
                color={prefs.language === 'am' ? colors.accent : colors.textSecondary}
              />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>አማርኛ</Text>
              <Text style={styles.optionSub}>Amharic language preference</Text>
            </View>
            {prefs.language === 'am' && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            )}
          </Pressable>

          <Pressable
            style={[styles.option, prefs.language === 'om' && styles.optionActive]}
            onPress={() => setPref('language', 'om')}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="language"
                size={22}
                color={prefs.language === 'om' ? colors.accent : colors.textSecondary}
              />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Oromo</Text>
              <Text style={styles.optionSub}>Oromo language preference</Text>
            </View>
            {prefs.language === 'om' && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
