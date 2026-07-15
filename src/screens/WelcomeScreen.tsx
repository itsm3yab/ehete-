import React, { useRef, useState, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

const slides = [
  {
    id: '1',
    icon: 'chatbubbles',
    title: 'Speak Your Mind',
    desc: "Share what's weighing on you without holding back. No names, no judgment — just real talk between men.",
  },
  {
    id: '2',
    icon: 'shield-checkmark',
    title: 'Your Truth Stays Here',
    desc: 'Everything you post is 100% anonymous. No names, no traces — your secret stays with us.',
  },
  {
    id: '3',
    icon: 'people',
    title: 'Brothers in It Together',
    desc: "Connect with other men who've walked the same path. Read, relate, and find strength in shared stories.",
  },
];

export default function WelcomeScreen({ navigation }: any) {
  const styles = useThemedStyles(makeWelcomeStyles);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const touchStart = useRef(0);

  const isLast = index === slides.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) return;
    flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, isLast]);

  const handleGuest = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }, [navigation]);

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
    ({ item }: any) => (
      <View style={styles.slide}>
        <View style={styles.iconWrap}>
          <Ionicons name={item.icon} size={48} color={colors.accent} />
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDesc}>{item.desc}</Text>
      </View>
    ),
    [styles, colors.accent]
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={['top', 'bottom']}
    >
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top > 0 ? 0 : 8, 8) }]}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.brandIcon}
          accessibilityLabel="etete"
        />
      </View>

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
              onPress={() => navigation.navigate('Login')}
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
    topSection: {
      paddingHorizontal: 28,
      paddingTop: 8,
    },
    brandIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
    },
    slide: {
      width,
      paddingHorizontal: 40,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingTop: 20,
    },
    iconWrap: {
      width: 96,
      height: 96,
      borderRadius: radius.xl,
      backgroundColor: colors.accentDim,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: 32,
    },
    slideTitle: {
      fontSize: typography.xxl,
      fontWeight: fontWeight.extrabold,
      color: colors.textPrimary,
      textAlign: 'center' as const,
      marginBottom: 14,
    },
    slideDesc: {
      fontSize: typography.md,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      lineHeight: 26,
      paddingHorizontal: 8,
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
