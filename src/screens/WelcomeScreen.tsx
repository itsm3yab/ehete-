import React, { useRef, useState, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useApp } from '../store/AppContext';
import { usePrefs, AppLanguage, ThemeMode } from '../store/preferences';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { hapticSelect } from '../utils/haptics';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

type Slide =
  | {
      id: string;
      type: 'prefs';
      title: string;
      desc: string;
    }
  | {
      id: string;
      type: 'info';
      icon: keyof typeof Ionicons.glyphMap;
      title: string;
      desc: string;
    };

const slides: Slide[] = [
  {
    id: '0',
    type: 'prefs',
    title: 'Make It Yours',
    desc: 'Choose your language and theme first. You can change these later in settings.',
  },
  {
    id: '1',
    type: 'info',
    icon: 'people',
    title: 'Welcome, Brothers',
    desc: 'This is a safe home for men and boys. Open up, lean on each other, and know you are never alone.',
  },
  {
    id: '2',
    type: 'info',
    icon: 'home',
    title: 'Share Like Family',
    desc: 'Talk about what is real. Pressure, love, school, money, pride, pain. No masks. No judgment. Just brothers.',
  },
  {
    id: '3',
    type: 'info',
    icon: 'shield-checkmark',
    title: 'You Are Safe Here',
    desc: 'Stay anonymous. No names, no pressure to perform. Post what you need to say and keep your privacy intact.',
  },
  {
    id: '4',
    type: 'info',
    icon: 'bar-chart',
    title: 'Vote With Your Bros',
    desc: 'Ask honest questions, cast your vote, and see what other men think. Real talk, real takes, no fake flex.',
  },
  {
    id: '5',
    type: 'info',
    icon: 'heart',
    title: 'Built For Us',
    desc: 'From young guys finding their way to grown men carrying weight, this space is yours. Jump in when you are ready.',
  },
];

const LANGUAGES: { id: AppLanguage; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'am', label: 'አማርኛ' },
  { id: 'om', label: 'Oromo' },
];

const THEMES: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'light', label: 'Light', icon: 'sunny' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
];

export default function WelcomeScreen({ navigation }: any) {
  const styles = useThemedStyles(makeWelcomeStyles);
  const colors = useColors();
  const { dispatch } = useApp();
  const { prefs, setPref } = usePrefs();
  const flatRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const touchStart = useRef(0);

  const isLast = index === slides.length - 1;

  const goMain = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
    );
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (isLast) return;
    flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, isLast]);

  const handleGoogle = useCallback(() => {
    dispatch({ type: 'LOGIN', payload: 'User' });
    goMain();
  }, [dispatch, goMain]);

  const handleGuest = useCallback(() => {
    goMain();
  }, [goMain]);

  const goToSlide = useCallback((i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
  }, []);

  const onMomentumEnd = useCallback((e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  }, []);

  const onTouchStart = useCallback((e: any) => {
    touchStart.current = e.nativeEvent.pageX;
  }, []);

  const onTouchEnd = useCallback(
    (e: any) => {
      const diff = touchStart.current - e.nativeEvent.pageX;
      if (diff > SWIPE_THRESHOLD && !isLast) handleNext();
    },
    [isLast, handleNext]
  );

  const renderSlide = useCallback(
    ({ item }: { item: Slide }) => {
      if (item.type === 'prefs') {
        return (
          <View style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name="options" size={44} color={colors.accent} />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.desc}</Text>

            <View style={styles.prefsBlock}>
              <Text style={styles.prefsLabel}>Language</Text>
              <View style={styles.langRow}>
                {LANGUAGES.map((lang) => {
                  const active = prefs.language === lang.id;
                  return (
                    <Pressable
                      key={lang.id}
                      style={[styles.langChip, active && styles.choiceChipActive]}
                      onPress={() => {
                        hapticSelect();
                        setPref('language', lang.id);
                      }}
                    >
                      <Text
                        style={[styles.choiceTitle, active && styles.choiceTitleActive]}
                        numberOfLines={1}
                      >
                        {lang.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.prefsLabel}>Theme</Text>
              <View style={styles.choiceRow}>
                {THEMES.map((theme) => {
                  const active = prefs.themeMode === theme.id;
                  return (
                    <Pressable
                      key={theme.id}
                      style={[styles.themeChip, active && styles.choiceChipActive]}
                      onPress={() => {
                        hapticSelect();
                        setPref('themeMode', theme.id);
                      }}
                    >
                      <Ionicons
                        name={theme.icon}
                        size={36}
                        color={active ? colors.accent : colors.textSecondary}
                      />
                      <Text
                        style={[styles.choiceTitle, active && styles.choiceTitleActive]}
                      >
                        {theme.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.slide}>
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={48} color={colors.accent} />
          </View>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDesc}>{item.desc}</Text>
        </View>
      );
    },
    [styles, colors.accent, colors.textSecondary, prefs.language, prefs.themeMode, setPref]
  );

  const keyExtractor = useCallback((item: Slide) => item.id, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={['top', 'bottom']}
    >
      <FlatList
        ref={flatRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumEnd}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        scrollEnabled={!isLast}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {!isLast ? (
          <Pressable
            style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.85 }]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
              onPress={handleGoogle}
            >
              <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </Pressable>

            <TouchableOpacity onPress={handleGuest} style={styles.guestBtn}>
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.disclaimer}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </SafeAreaView>
  );
}

function makeWelcomeStyles(colors: ColorPalette) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingBottom: 16,
    },
    slide: {
      width,
      paddingHorizontal: 28,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingTop: 12,
    },
    iconWrap: {
      width: 88,
      height: 88,
      borderRadius: radius.xl,
      backgroundColor: colors.accentDim,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: 24,
    },
    slideTitle: {
      fontSize: typography.xxl,
      fontWeight: fontWeight.extrabold,
      color: colors.textPrimary,
      textAlign: 'center' as const,
      marginBottom: 12,
    },
    slideDesc: {
      fontSize: typography.md,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      lineHeight: 24,
      paddingHorizontal: 8,
    },
    prefsBlock: {
      width: '100%',
      marginTop: 28,
      gap: 12,
    },
    prefsLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: fontWeight.semibold,
      letterSpacing: 0.4,
      textTransform: 'uppercase' as const,
      marginTop: 6,
    },
    choiceRow: {
      flexDirection: 'row' as const,
      gap: 12,
    },
    langRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 10,
    },
    langChip: {
      width: '31%',
      minHeight: 64,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 18,
      paddingHorizontal: 8,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    themeChip: {
      flex: 1,
      aspectRatio: 1,
      maxHeight: 120,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 10,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    choiceChipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentDim,
    },
    choiceTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.base,
    },
    choiceTitleActive: {
      color: colors.accent,
      fontWeight: fontWeight.bold,
    },
    bottomSection: {
      paddingHorizontal: 28,
      gap: 28,
      paddingTop: 12,
    },
    dots: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 24,
      backgroundColor: colors.accent,
      borderRadius: 4,
    },
    nextBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      backgroundColor: colors.accent,
      paddingVertical: 16,
      borderRadius: radius.full,
    },
    nextBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
      letterSpacing: 0.2,
    },
    actions: {
      gap: 12,
    },
    googleBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 10,
      paddingVertical: 15,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    googleBtnText: {
      color: colors.textPrimary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.base,
    },
    guestBtn: {
      alignItems: 'center' as const,
      paddingVertical: 10,
    },
    guestText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    disclaimer: {
      color: colors.textMeta,
      fontSize: typography.xs,
      textAlign: 'center' as const,
      paddingTop: 20,
      paddingHorizontal: 28,
    },
  };
}
