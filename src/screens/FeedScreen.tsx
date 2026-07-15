import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ConfessionCard from '../components/ConfessionCard';
import SkeletonCard from '../components/SkeletonCard';
import SideDrawer, { DrawerAvatarButton } from '../components/SideDrawer';
import {
  useColors,
  typography,
  fontWeight,
  radius,
  ColorPalette,
} from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';
import { hapticLight, hapticSelect } from '../utils/haptics';
import type { SortMode } from '../types';

const SORT_OPTIONS: { label: string; value: SortMode; icon: string }[] = [
  { label: 'Newest', value: 'new', icon: 'time-outline' },
  { label: 'Top Voted', value: 'top', icon: 'trending-up-outline' },
  { label: 'Oldest', value: 'oldest', icon: 'calendar-outline' },
];

const TOP_BAR_H = 52;

export default function FeedScreen({ navigation }: any) {
  const styles = useThemedStyles(makeFeedStyles);
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { onScroll, hideTabBar, showTabBar } = useTabBarScroll();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const isGuest = !state.isLoggedIn;
  const displayName = isGuest ? 'Guest' : state.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const openDrawer = useCallback(() => {
    hapticLight();
    hideTabBar();
    setDrawerOpen(true);
  }, [hideTabBar]);

  const closeDrawer = useCallback(() => {
    hapticLight();
    setDrawerOpen(false);
    showTabBar();
  }, [showTabBar]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View
        style={[
          styles.topBar,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <DrawerAvatarButton
          onPress={openDrawer}
          initial={initial}
          isGuest={isGuest}
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
          onPress={() => setSortOpen(true)}
          style={styles.sortBtn}
          accessibilityLabel="Sort confessions"
        >
          <Ionicons name={currentSort.icon as any} size={16} color={colors.accent} />
          <Text style={styles.sortBtnText}>{currentSort.label}</Text>
        </TouchableOpacity>
      </View>

      {state.selectedCategory && (
        <View style={styles.activeCatRow}>
          <View style={styles.activeCatChip}>
            <Text style={styles.activeCatText}>{state.selectedCategory}</Text>
            <TouchableOpacity
              onPress={() => dispatch({ type: 'SET_CATEGORY', payload: null })}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="close" size={13} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state.isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <SkeletonCard />}
          scrollEnabled={false}
        />
      ) : sorted.length === 0 ? (
        <View style={styles.empty}>
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
          contentContainerStyle={{ paddingBottom: 110 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
          updateCellsBatchingPeriod={40}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        />
      )}

      {/* Edge strip starts BELOW the top bar so it never blocks the avatar */}
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
        <Pressable style={styles.sortOverlay} onPress={() => setSortOpen(false)}>
          <View style={styles.sortMenu}>
            <Text style={styles.sortTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.sortItem,
                  state.sortMode === opt.value && styles.sortItemActive,
                ]}
                onPress={() => {
                  dispatch({ type: 'SET_SORT', payload: opt.value });
                  setSortOpen(false);
                }}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={
                    state.sortMode === opt.value
                      ? colors.accent
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.sortText,
                    state.sortMode === opt.value && { color: colors.accent },
                  ]}
                >
                  {opt.label}
                </Text>
                {state.sortMode === opt.value && (
                  <Ionicons name="checkmark-circle" size={17} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function makeFeedStyles(colors: ColorPalette) {
  return {
    container: { flex: 1, backgroundColor: colors.bg },
    edgeSwipe: {
      position: 'absolute' as const,
      left: 0,
      top: TOP_BAR_H,
      bottom: 0,
      width: 32,
      zIndex: 40,
      elevation: 40,
    },
    topBar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 10,
      zIndex: 60,
      elevation: 60,
      backgroundColor: colors.bg,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.bgInput,
      borderRadius: radius.full,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 7,
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
      gap: 5,
      backgroundColor: colors.accentDim,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: radius.full,
    },
    sortBtnText: {
      color: colors.accent,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    activeCatRow: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    activeCatChip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      alignSelf: 'flex-start' as const,
      backgroundColor: colors.accentDim,
      borderRadius: radius.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
      gap: 6,
    },
    activeCatText: {
      color: colors.accent,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
    },
    empty: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 10,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: typography.lg,
      fontWeight: fontWeight.semibold,
    },
    emptySubText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      textAlign: 'center' as const,
    },


    sortOverlay: {
      flex: 1,
      justifyContent: 'flex-start' as const,
      alignItems: 'flex-end' as const,
      paddingTop: 52,
      paddingRight: 14,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sortMenu: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      minWidth: 190,
      overflow: 'hidden' as const,
      paddingVertical: 4,
    },
    sortTitle: {
      color: colors.textMeta,
      fontSize: typography.xs,
      fontWeight: fontWeight.semibold,
      paddingHorizontal: 14,
      paddingVertical: 8,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.4,
    },
    sortItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    sortItemActive: {
      backgroundColor: colors.accentDim,
    },
    sortText: {
      color: colors.textPrimary,
      fontSize: typography.sm,
      flex: 1,
    },
  };
}
