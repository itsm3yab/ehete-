import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  type HandlerStateChangeEvent,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ConfessionCard from '../components/ConfessionCard';
import SkeletonCard from '../components/SkeletonCard';
import SideDrawer, { DrawerAvatarButton } from '../components/SideDrawer';
import { useAuthGate } from '../components/AuthGate';
import {
  useColors,
  useTheme,
  typography,
  fontWeight,
  radius,
  ColorPalette,
} from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';
import { hapticLight, hapticSelect } from '../utils/haptics';
import { getCategoryTheme } from '../components/utils';
import { CATEGORIES, type SortMode } from '../types';

const SORT_OPTIONS: { label: string; value: SortMode; icon: string }[] = [
  { label: 'Newest', value: 'new', icon: 'time-outline' },
  { label: 'Top Voted', value: 'top', icon: 'trending-up-outline' },
  { label: 'Oldest', value: 'oldest', icon: 'calendar-outline' },
];

const CAT_SHORT: Record<string, string> = {
  'Love/Cheating': 'Love',
  Family: 'Family',
  Friendship: 'Friends',
  Work: 'Work',
  School: 'School',
  'Health & Wellness': 'Health',
  Technology: 'Tech',
  Other: 'Other',
};

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Love/Cheating': 'heart',
  Family: 'home',
  Friendship: 'people',
  Work: 'briefcase',
  School: 'school',
  'Health & Wellness': 'fitness',
  Technology: 'phone-portrait',
  Other: 'sparkles',
};

const HEADER_BODY_H = 108;
const SCROLL_HIDE_THRESHOLD = 4;

export default function FeedScreen({ navigation }: any) {
  const styles = useThemedStyles(makeFeedStyles);
  const colors = useColors();
  const { mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const pageBg = mode === 'light' ? '#ffffff' : colors.bg;
  const { requireAuth } = useAuthGate();
  const { onScroll: onTabScroll, hideTabBar, showTabBar } = useTabBarScroll();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const headerOffset = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const headerShown = useRef(true);
  const headerHeightRef = useRef(insets.top + HEADER_BODY_H);
  const spacerH = insets.top + HEADER_BODY_H;

  const isGuest = !state.isLoggedIn;
  const displayName = isGuest ? 'Guest' : state.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const setHeaderShown = useCallback(
    (show: boolean) => {
      if (headerShown.current === show) return;
      headerShown.current = show;
      setHeaderVisible(show);
      Animated.parallel([
        Animated.timing(headerOffset, {
          toValue: show ? 0 : -headerHeightRef.current,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: show ? 1 : 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [headerOffset, headerOpacity]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      onTabScroll(e);

      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y <= 10) {
        setHeaderShown(true);
        return;
      }

      if (dy > SCROLL_HIDE_THRESHOLD) {
        setHeaderShown(false);
      } else if (dy < -SCROLL_HIDE_THRESHOLD) {
        setHeaderShown(true);
      }
    },
    [onTabScroll, setHeaderShown]
  );

  const openDrawer = useCallback(() => {
    hapticLight();
    hideTabBar();
    setDrawerOpen(true);
  }, [hideTabBar]);

  const closeDrawer = useCallback(() => {
    hapticLight();
    setDrawerOpen(false);
    showTabBar();
    setHeaderShown(true);
  }, [showTabBar, setHeaderShown]);

  const openDrawerRef = useRef(openDrawer);
  openDrawerRef.current = openDrawer;

  const onEdgeGesture = useCallback(
    (e: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
      const { state: gs, translationX, velocityX, oldState } = e.nativeEvent;
      if (oldState !== State.ACTIVE) return;
      if (gs !== State.END && gs !== State.CANCELLED) return;
      if (translationX > 20 || velocityX > 250) {
        openDrawerRef.current();
      }
    },
    []
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    hapticSelect();
    dispatch({ type: 'SET_LOADING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'LOAD_DATA' });
      setRefreshing(false);
    }, 750);
  }, [dispatch]);

  const sorted = useMemo(() => {
    let list = state.confessions;
    if (state.selectedCategory) {
      list = list.filter((c) => c.category === state.selectedCategory);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.text.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    switch (state.sortMode) {
      case 'top':
        return [...list].sort(
          (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
        );
      case 'oldest':
        return [...list].sort((a, b) => a.timestamp - b.timestamp);
      default:
        return [...list].sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [state.confessions, state.selectedCategory, state.sortMode, searchText]);

  const currentSort = SORT_OPTIONS.find((o) => o.value === state.sortMode)!;

  const renderItem = useCallback(
    ({ item }: any) => (
      <ConfessionCard
        confession={item}
        onPress={() => navigation.navigate('Detail', { confession: item })}
      />
    ),
    [navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: pageBg }]}>
      <Animated.View
        pointerEvents={headerVisible ? 'auto' : 'none'}
        onLayout={(e) => {
          headerHeightRef.current = e.nativeEvent.layout.height;
        }}
        style={[
          styles.headerChrome,
          {
            backgroundColor: pageBg,
            paddingTop: insets.top,
            opacity: headerOpacity,
            transform: [{ translateY: headerOffset }],
          },
        ]}
      >
        <View style={[styles.topBar, { backgroundColor: pageBg }]}>
          <DrawerAvatarButton
            onPress={openDrawer}
            initial={initial}
            isGuest={isGuest}
            avatarUri={state.avatarUri}
          />

          <View style={styles.searchBar}>
            <Ionicons name="search" size={15} color={colors.textMeta} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search confessions..."
              placeholderTextColor={colors.textMeta}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={15} color={colors.textMeta} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              hapticSelect();
              navigation.navigate('Notifications');
            }}
            style={styles.notifBtn}
            accessibilityLabel="Open notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
            {state.distressSignals.some((d) => d.status === 'active') && (
              <View style={styles.notifDot} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortOpen(true)}
            style={styles.sortBtn}
            accessibilityLabel="Sort confessions"
          >
            <Ionicons name={currentSort.icon as any} size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
          style={styles.catScroll}
        >
          <TouchableOpacity
            style={[styles.catChip, !state.selectedCategory && styles.catChipAllActive]}
            onPress={() => {
              hapticSelect();
              dispatch({ type: 'SET_CATEGORY', payload: null });
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name="flame"
              size={14}
              color={!state.selectedCategory ? '#fff' : colors.accent}
            />
            <Text
              style={[
                styles.catChipText,
                !state.selectedCategory && styles.catChipTextActive,
              ]}
            >
              For you
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((cat) => {
            const active = state.selectedCategory === cat;
            const theme = getCategoryTheme(cat, mode);
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  active && {
                    backgroundColor: theme.dot,
                    borderColor: theme.dot,
                  },
                ]}
                onPress={() => {
                  hapticSelect();
                  dispatch({
                    type: 'SET_CATEGORY',
                    payload: active ? null : cat,
                  });
                }}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={CAT_ICON[cat] ?? 'ellipse'}
                  size={13}
                  color={active ? '#fff' : theme.dot}
                />
                <Text
                  style={[
                    styles.catChipText,
                    { color: active ? '#fff' : colors.textPrimary },
                    active && styles.catChipTextActive,
                  ]}
                >
                  {CAT_SHORT[cat] ?? cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {state.isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <SkeletonCard />}
          scrollEnabled={false}
          ListHeaderComponent={<View style={{ height: spacerH }} />}
        />
      ) : sorted.length === 0 ? (
        <View style={[styles.empty, { paddingTop: spacerH }]}>
          <Ionicons name="chatbubbles-outline" size={56} color={colors.textMeta} />
          <Text style={styles.emptyTitle}>
            {searchText ? `No results for "${searchText}"` : 'No confessions yet'}
          </Text>
          <Text style={styles.emptySubText}>
            {searchText ? 'Try different keywords' : 'Be the first to speak your mind.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: pageBg, flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110, backgroundColor: pageBg, flexGrow: 1 }}
          ListHeaderComponent={<View style={{ height: spacerH }} />}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews={false}
          updateCellsBatchingPeriod={40}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
              progressBackgroundColor={pageBg}
              progressViewOffset={spacerH}
            />
          }
        />
      )}

      {!drawerOpen && (
        <PanGestureHandler
          onHandlerStateChange={onEdgeGesture}
          activeOffsetX={12}
          failOffsetY={[-28, 28]}
        >
          <View style={styles.edgeSwipe} collapsable={false} />
        </PanGestureHandler>
      )}

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        navigation={navigation}
      />

      <Modal
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSortOpen(false)}>
          <View style={styles.sortSheet}>
            <Text style={styles.sortTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.sortOption,
                  state.sortMode === opt.value && styles.sortOptionActive,
                ]}
                onPress={() => {
                  hapticSelect();
                  dispatch({ type: 'SET_SORT', payload: opt.value });
                  setSortOpen(false);
                }}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={
                    state.sortMode === opt.value ? colors.accent : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.sortOptionText,
                    state.sortMode === opt.value && styles.sortOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <TouchableOpacity
        style={styles.createFab}
        onPress={() => {
          hapticSelect();
          if (!requireAuth('Sign in to share a confession.')) return;
          navigation.navigate('Post');
        }}
        activeOpacity={0.9}
        accessibilityLabel="Create post"
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function makeFeedStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: '#ffffff', overflow: 'hidden' as const },
    edgeSwipe: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: 32,
      zIndex: 40,
      elevation: 40,
    },
    headerChrome: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      elevation: 60,
    },
    topBar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 14,
      paddingVertical: 8,
      gap: 10,
      backgroundColor: '#ffffff',
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: '#ffffff',
      borderRadius: radius.full,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 7,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#eeeeee',
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.sm,
      padding: 0,
    },
    sortBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#ffffff',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#eeeeee',
    },
    notifBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: '#ffffff',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#eeeeee',
    },
    notifDot: {
      position: 'absolute' as const,
      top: 7,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.danger,
      borderWidth: 1.5,
      borderColor: '#ffffff',
    },
    createFab: {
      position: 'absolute' as const,
      right: 18,
      bottom: 96,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: '#FF4500',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      zIndex: 30,
      ...Platform.select({
        ios: {
          shadowColor: '#FF4500',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        android: { elevation: 8 },
        default: {},
      }),
    },
    catScroll: {
      flexGrow: 0,
      backgroundColor: '#ffffff',
    },
    catRow: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      alignItems: 'center' as const,
    },
    catChip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      minHeight: 36,
      borderRadius: radius.full,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#eeeeee',
    },
    catChipAllActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    catChipText: {
      color: colors.textPrimary,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    catChipTextActive: {
      color: '#fff',
    },
    empty: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 32,
      gap: 8,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: typography.lg,
      fontWeight: fontWeight.bold,
      textAlign: 'center' as const,
      marginTop: 8,
    },
    emptySubText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      textAlign: 'center' as const,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end' as const,
    },
    sortSheet: {
      backgroundColor: colors.bgElevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
      gap: 4,
    },
    sortTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
      marginBottom: 8,
    },
    sortOption: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderRadius: radius.md,
    },
    sortOptionActive: {
      backgroundColor: colors.accentDim,
    },
    sortOptionText: {
      color: colors.textSecondary,
      fontSize: typography.base,
      fontWeight: fontWeight.medium,
    },
    sortOptionTextActive: {
      color: colors.accent,
      fontWeight: fontWeight.bold,
    },
  };
}
