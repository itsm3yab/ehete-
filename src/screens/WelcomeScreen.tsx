import React, { useRef, useState, useCallback, useEffect } from 'react';
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
import { CommonActions, useRoute } from '@react-navigation/native';
import { usePrefs, AppLanguage, ThemeMode } from '../store/preferences';
import { typography, fontWeight, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { hapticSelect } from '../utils/haptics';

const { width } = Dimensions.get('window');

type Slide =
  | { id: string; type: 'prefs' }
  | {
      id: string;
      type: 'info';
      icon: keyof typeof Ionicons.glyphMap;
      brand?: boolean;
      title: string;
      desc: string;
    };

const slides: Slide[] = [
  { id: '0', type: 'prefs' },
  {
    id: '1',
    type: 'info',
    icon: 'heart',
    brand: true,
    title: 'እህቴ',
    desc: 'A private home for girls who need to be heard. You belong here.',
  },
  {
    id: '2',
    type: 'info',
    icon: 'shield-checkmark',
    title: 'We saved you a seat',
    desc: 'Anonymous. Kind. Built for sisters looking out for each other.',
  },
];

const LANGUAGES: { id: AppLanguage; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'am', label: 'አማርኛ' },
  { id: 'om', label: 'Oromo' },
];

const THEMES: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'light', label: 'Light', icon: 'sunny-outline' },
  { id: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function WelcomeScreen({ navigation }: any) {
  const styles = useThemedStyles(makeWelcomeStyles);
  const colors = useColors();
  const { prefs, setPref } = usePrefs();
  const route = useRoute<any>();
  const flatRef = useRef<FlatList>(null);
  const lastIndex = slides.length - 1;
  const startAtEnd = !!route.params?.startAtEnd;
  const [index, setIndex] = useState(startAtEnd ? lastIndex : 0);
  const [listHeight, setListHeight] = useState(0);

  const isLast = index === lastIndex;

  useEffect(() => {
    if (!startAtEnd) return;
    const id = requestAnimationFrame(() => {
      flatRef.current?.scrollToIndex({ index: lastIndex, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [startAtEnd, lastIndex]);

  const goMain = useCallback(() => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
  }, [navigation]);

  const goLogin = useCallback(() => {
    hapticSelect();
    navigation.navigate('Login');
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (isLast) {
      goLogin();
      return;
    }
    flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, isLast, goLogin]);

  const goToSlide = useCallback((i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
  }, []);

  const onMomentumEnd = useCallback((e: any) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }, []);

  const renderSlide = useCallback(
    ({ item }: { item: Slide }) => {
      if (item.type === 'prefs') {
        return (
          <View style={[styles.slide, listHeight > 0 && { height: listHeight }]}>
            <Text style={styles.kicker}>Welcome</Text>
            <Text style={styles.slideTitle}>Glad you are here</Text>
            <Text style={styles.slideDesc}>
              Choose how you want እህቴ to feel. You can change this later.
            </Text>

            <View style={styles.prefsBlock}>
              <Text style={styles.prefsLabel}>Language</Text>
              <View style={styles.langRow}>
                {LANGUAGES.map((lang) => {
                  const active = prefs.language === lang.id;
                  return (
                    <Pressable
                      key={lang.id}
                      style={[styles.choiceChip, active && styles.choiceChipActive]}
                      onPress={() => {
                        if (active) return;
                        hapticSelect();
                        setPref('language', lang.id);
                      }}
                    >
                      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                        {lang.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.prefsLabel}>Appearance</Text>
              <View style={styles.themeRow}>
                {THEMES.map((theme) => {
                  const active = prefs.themeMode === theme.id;
                  return (
                    <Pressable
                      key={theme.id}
                      style={[styles.choiceChip, styles.themeChip, active && styles.choiceChipActive]}
                      onPress={() => {
                        if (active) return;
                        hapticSelect();
                        setPref('themeMode', theme.id);
                      }}
                    >
                      <Ionicons
                        name={theme.icon}
                        size={18}
                        color={active ? colors.accent : colors.textSecondary}
                      />
                      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
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
        <View style={[styles.slide, listHeight > 0 && { height: listHeight }]}>
          <View style={styles.iconCircle}>
            <Ionicons name={item.icon} size={32} color={colors.accent} />
          </View>
          <Text style={[styles.slideTitle, item.brand && styles.brandTitle]}>{item.title}</Text>
          {item.brand && <Text style={styles.brandSub}>ehete · my sister</Text>}
          <Text style={styles.slideDesc}>{item.desc}</Text>
        </View>
      );
    },
    [styles, colors, prefs.language, prefs.themeMode, setPref, listHeight]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Text style={styles.topBrand}>እህቴ</Text>
        {!isLast ? (
          <TouchableOpacity onPress={() => goToSlide(lastIndex)} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <View
        style={styles.listWrap}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
      >
        {listHeight > 0 && (
          <FlatList
            ref={flatRef}
            data={slides}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={onMomentumEnd}
            scrollEnabled={!isLast}
            initialScrollIndex={startAtEnd ? lastIndex : 0}
            getItemLayout={(_, i) => ({
              length: width,
              offset: width * i,
              index: i,
            })}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatRef.current?.scrollToIndex({ index: info.index, animated: false });
              }, 50);
            }}
          />
        )}
      </View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        {!isLast ? (
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
            onPress={handleNext}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </Pressable>
        ) : (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
              onPress={goLogin}
            >
              <Text style={styles.primaryBtnText}>Get started</Text>
            </Pressable>
            <TouchableOpacity onPress={goMain} style={styles.guestBtn}>
              <Text style={styles.guestText}>Continue as guest</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function makeWelcomeStyles(colors: ColorPalette) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    topBar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 4,
    },
    topBrand: {
      color: colors.accent,
      fontSize: typography.base,
      fontWeight: fontWeight.bold,
    },
    skipText: {
      color: colors.textMeta,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    listWrap: {
      flex: 1,
    },
    slide: {
      width,
      paddingHorizontal: 32,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    kicker: {
      color: colors.accent,
      fontSize: typography.xs,
      fontWeight: fontWeight.bold,
      letterSpacing: 1.2,
      textTransform: 'uppercase' as const,
      marginBottom: 10,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.accentDim,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: 22,
    },
    slideTitle: {
      fontSize: 26,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center' as const,
      letterSpacing: -0.4,
      marginBottom: 10,
    },
    brandTitle: {
      fontSize: 36,
      color: colors.accent,
      marginBottom: 4,
    },
    brandSub: {
      color: colors.textMeta,
      fontSize: typography.xs,
      marginBottom: 12,
    },
    slideDesc: {
      fontSize: typography.sm,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      lineHeight: 22,
      maxWidth: 300,
    },
    prefsBlock: {
      width: '100%',
      marginTop: 32,
      gap: 10,
    },
    prefsLabel: {
      color: colors.textMeta,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
      marginTop: 6,
      marginBottom: 2,
    },
    langRow: {
      flexDirection: 'row' as const,
      gap: 8,
    },
    themeRow: {
      flexDirection: 'row' as const,
      gap: 8,
    },
    choiceChip: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 13,
      borderRadius: 12,
      backgroundColor: colors.bgInput,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    themeChip: {
      flexDirection: 'row' as const,
      gap: 8,
    },
    choiceChipActive: {
      backgroundColor: colors.accentDim,
      borderColor: colors.accent,
    },
    choiceText: {
      color: colors.textSecondary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.sm,
    },
    choiceTextActive: {
      color: colors.accent,
    },
    bottom: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      paddingTop: 8,
      gap: 16,
    },
    dots: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 18,
      backgroundColor: colors.accent,
    },
    primaryBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 10,
      backgroundColor: colors.accent,
      paddingVertical: 15,
      borderRadius: 14,
    },
    primaryBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    actions: { gap: 12 },
    guestBtn: {
      alignItems: 'center' as const,
      paddingVertical: 6,
    },
    guestText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
  };
}
