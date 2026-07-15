import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ConfessionCard from '../components/ConfessionCard';
import SkeletonCard from '../components/SkeletonCard';
import { colors, typography, fontWeight, radius } from '../store/theme';
import { CATEGORIES } from '../types';
import { getCategoryTheme } from '../components/utils';
import type { SortMode } from '../types';

const SORT_OPTIONS: { label: string; value: SortMode; icon: string }[] = [
  { label: 'Newest', value: 'new', icon: 'time-outline' },
  { label: 'Top Voted', value: 'top', icon: 'trending-up-outline' },
  { label: 'Oldest', value: 'oldest', icon: 'calendar-outline' },
];

export default function FeedScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const translateX = useRef(new Animated.Value(-320)).current;
  const drawerBg = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(drawerBg, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: -320, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(drawerBg, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, []);

  const sorted = useMemo(() => {
    let list = state.confessions;
    if (state.selectedCategory)
      list = list.filter((c) => c.category === state.selectedCategory);
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
        return [...list].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.iconBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel="Open menu"
        >
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

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
            <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
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

      {/* Active category chip */}
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

      {/* Content */}
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
            {searchText ? 'Try different keywords' : 'Be the first to share something.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      {/* Category Drawer */}
      {drawerOpen && (
        <Modal visible transparent animationType="none" onRequestClose={closeDrawer}>
          <Animated.View
            style={[styles.drawerOverlay, {
              opacity: drawerBg.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            }]}
          >
            <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
          </Animated.View>
          <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            {/* Drawer header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerLogo}>etete</Text>
              <TouchableOpacity onPress={closeDrawer}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.drawerSectionTitle}>Categories</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* All */}
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => { dispatch({ type: 'SET_CATEGORY', payload: null }); closeDrawer(); }}
              >
                <View style={[styles.drawerDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.drawerItemText, !state.selectedCategory && styles.drawerItemActive]}>
                  All Confessions
                </Text>
                {!state.selectedCategory && (
                  <Ionicons name="checkmark" size={16} color={colors.accent} />
                )}
              </TouchableOpacity>

              {CATEGORIES.map((cat) => {
                const theme = getCategoryTheme(cat);
                const isActive = state.selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={styles.drawerItem}
                    onPress={() => { dispatch({ type: 'SET_CATEGORY', payload: cat }); closeDrawer(); }}
                  >
                    <View style={[styles.drawerDot, { backgroundColor: theme.dot }]} />
                    <Text style={[styles.drawerItemText, isActive && styles.drawerItemActive]}>
                      {cat}
                    </Text>
                    {isActive && <Ionicons name="checkmark" size={16} color={colors.accent} />}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => { closeDrawer(); navigation.navigate('HelpSupport'); }}
              >
                <Ionicons name="heart-outline" size={16} color={colors.upvote} />
                <Text style={styles.drawerItemText}>Help & Support</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Modal>
      )}

      {/* Sort sheet */}
      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.sortOverlay} onPress={() => setSortOpen(false)}>
          <View style={styles.sortMenu}>
            <Text style={styles.sortTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortItem, state.sortMode === opt.value && styles.sortItemActive]}
                onPress={() => { dispatch({ type: 'SET_SORT', payload: opt.value }); setSortOpen(false); }}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={state.sortMode === opt.value ? colors.accent : colors.textSecondary}
                />
                <Text style={[styles.sortText, state.sortMode === opt.value && { color: colors.accent }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    gap: 8,
  },
  iconBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  activeCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accentDim,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  activeCatText: { color: colors.accent, fontSize: typography.xs, fontWeight: fontWeight.semibold },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: fontWeight.semibold },
  emptySubText: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center' },
  // Drawer
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: colors.bgDrawer,
    borderRightWidth: 0.5,
    borderRightColor: colors.border,
    paddingTop: 56,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  drawerLogo: {
    fontSize: typography.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  drawerSectionTitle: {
    color: colors.textMeta,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 20,
    gap: 12,
  },
  drawerDot: { width: 8, height: 8, borderRadius: 4 },
  drawerItemText: {
    color: colors.textSecondary,
    fontSize: typography.base,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  drawerItemActive: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
  drawerDivider: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  // Sort
  sortOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 52,
    paddingRight: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sortMenu: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    minWidth: 190,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  sortTitle: {
    color: colors.textMeta,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  sortItemActive: { backgroundColor: colors.accentDim },
  sortText: { color: colors.textPrimary, fontSize: typography.sm, flex: 1 },
});
