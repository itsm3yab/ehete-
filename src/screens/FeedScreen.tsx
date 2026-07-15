import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ConfessionCard from '../components/ConfessionCard';
import SkeletonCard from '../components/SkeletonCard';
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
import { CATEGORIES } from '../types';
import { getCategoryTheme } from '../components/utils';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';
import { navigationRef } from '../navigation/navigationRef';
import { hapticLight, hapticSelect } from '../utils/haptics';
import type { SortMode } from '../types';

const SORT_OPTIONS: { label: string; value: SortMode; icon: string }[] = [
  { label: 'Newest', value: 'new', icon: 'time-outline' },
  { label: 'Top Voted', value: 'top', icon: 'trending-up-outline' },
  { label: 'Oldest', value: 'oldest', icon: 'calendar-outline' },
];

const DRAWER_W = Math.min(Math.round(Dimensions.get('window').width * 0.82), 320);
const TOP_BAR_H = 52;

export default function FeedScreen({ navigation }: any) {
  const styles = useThemedStyles(makeFeedStyles);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { onScroll, hideTabBar, showTabBar } = useTabBarScroll();
  const { mode } = useTheme();
  const { requireAuth } = useAuthGate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const isGuest = !state.isLoggedIn;
  const displayName = isGuest ? 'Guest' : state.username || 'User';
  const handle = isGuest
    ? '@guest'
    : `@${displayName.toLowerCase().replace(/\s/g, '_')}`;
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

  const go = useCallback(
    (action: () => void) => {
      closeDrawer();
      setTimeout(action, 180);
    },
    [closeDrawer]
  );

  const openAuthed = useCallback(
    (screen: string, reason: string) => {
      go(() => {
        if (!requireAuth(reason)) return;
        navigation.navigate(screen);
      });
    },
    [go, requireAuth, navigation]
  );

  const handleLogout = useCallback(() => {
    closeDrawer();
    setTimeout(() => {
      Alert.alert('Sign Out?', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'LOGOUT' });
            if (navigationRef.isReady()) {
              navigationRef.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })
              );
            }
          },
        },
      ]);
    }, 180);
  }, [closeDrawer, dispatch]);

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

  const DrawerRow = ({
    icon,
    label,
    onPress,
    compact,
    danger,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    compact?: boolean;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.xRow, compact && styles.xRowCompact]}
      onPress={() => {
        hapticSelect();
        onPress();
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={compact ? 20 : 24}
        color={danger ? colors.danger : colors.textPrimary}
      />
      <Text
        style={[
          styles.xRowLabel,
          compact && styles.xRowLabelCompact,
          danger && { color: colors.danger },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View
        style={[
          styles.topBar,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.avatarBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={[styles.navAvatar, isGuest && styles.navAvatarGuest]}>
            <Text style={[styles.navAvatarText, isGuest && styles.navAvatarGuestText]}>
              {initial}
            </Text>
          </View>
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

      {/* Side menu — Modal covers the tab bar reliably */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerRoot}>
          <Pressable style={styles.drawerScrim} onPress={closeDrawer} />
          <View
            style={[
              styles.drawerPanel,
              {
                width: DRAWER_W,
                paddingTop: Math.max(insets.top, 10) + 6,
                paddingBottom: Math.max(insets.bottom, 10),
                backgroundColor: colors.bgDrawer,
                borderRightColor: colors.border,
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.drawerScroll}
              bounces={false}
              style={{ flex: 1 }}
            >
              <View style={styles.xHeader}>
                <TouchableOpacity
                  onPress={() => go(() => navigation.navigate('Profile'))}
                  activeOpacity={0.85}
                >
                  <View style={[styles.xAvatar, isGuest && styles.xAvatarGuest]}>
                    <Text style={[styles.xAvatarText, isGuest && styles.xAvatarGuestText]}>
                      {initial}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.xDisplayName}>{displayName}</Text>
                <Text style={styles.xHandle}>{handle}</Text>
              </View>

              <View style={styles.xHairline} />

              <View style={styles.xNavBlock}>
                <DrawerRow
                  icon="person-outline"
                  label="Profile"
                  onPress={() => go(() => navigation.navigate('Profile'))}
                />
                <DrawerRow
                  icon="document-text-outline"
                  label="My Confessions"
                  onPress={() =>
                    openAuthed('MyConfessions', 'Sign in to view your confessions.')
                  }
                />
                <DrawerRow
                  icon="bookmark-outline"
                  label="Saved"
                  onPress={() => openAuthed('Saved', 'Sign in to view saved posts.')}
                />
                <TouchableOpacity
                  style={styles.xRow}
                  onPress={() => setCategoriesOpen((v) => !v)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="grid-outline" size={24} color={colors.textPrimary} />
                  <Text style={styles.xRowLabel}>Categories</Text>
                  <Ionicons
                    name={categoriesOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                    style={{ marginLeft: 'auto' }}
                  />
                </TouchableOpacity>

                {categoriesOpen && (
                  <View style={styles.listsBlock}>
                    <TouchableOpacity
                      style={[
                        styles.listItem,
                        !state.selectedCategory && styles.listItemActive,
                      ]}
                      onPress={() =>
                        go(() => dispatch({ type: 'SET_CATEGORY', payload: null }))
                      }
                    >
                      <View style={[styles.listDot, { backgroundColor: colors.accent }]} />
                      <Text
                        style={[
                          styles.listItemText,
                          !state.selectedCategory && styles.listItemTextActive,
                        ]}
                      >
                        All Confessions
                      </Text>
                    </TouchableOpacity>
                    {CATEGORIES.map((cat) => {
                      const theme = getCategoryTheme(cat, mode);
                      const active = state.selectedCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.listItem, active && styles.listItemActive]}
                          onPress={() =>
                            go(() => dispatch({ type: 'SET_CATEGORY', payload: cat }))
                          }
                        >
                          <View
                            style={[styles.listDot, { backgroundColor: theme.dot }]}
                          />
                          <Text
                            style={[
                              styles.listItemText,
                              active && styles.listItemTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.xHairline} />

              <View style={styles.xNavBlockCompact}>
                <Text style={styles.xSectionLabel}>Settings & Support</Text>
                <DrawerRow
                  compact
                  icon="notifications-outline"
                  label="Notifications"
                  onPress={() => go(() => navigation.navigate('NotificationsSettings'))}
                />
                <DrawerRow
                  compact
                  icon="shield-checkmark-outline"
                  label="Privacy & Safety"
                  onPress={() => go(() => navigation.navigate('PrivacySettings'))}
                />
                <DrawerRow
                  compact
                  icon="moon-outline"
                  label="Appearance"
                  onPress={() => go(() => navigation.navigate('AppearanceSettings'))}
                />
                <DrawerRow
                  compact
                  icon="help-circle-outline"
                  label="Help & Support"
                  onPress={() => go(() => navigation.navigate('HelpSupport'))}
                />
                <DrawerRow
                  compact
                  icon="information-circle-outline"
                  label="About Etete"
                  onPress={() => go(() => navigation.navigate('About'))}
                />
                {!isGuest && (
                  <DrawerRow
                    compact
                    danger
                    icon="log-out-outline"
                    label="Sign Out"
                    onPress={handleLogout}
                  />
                )}
              </View>
            </ScrollView>

            {isGuest && (
              <View style={styles.guestCtaWrap}>
                <TouchableOpacity
                  style={styles.guestCta}
                  onPress={() => go(() => navigation.navigate('Login'))}
                >
                  <Text style={styles.guestCtaText}>Sign in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.guestSecondary}
                  onPress={() => go(() => navigation.navigate('Signup'))}
                >
                  <Text style={styles.guestSecondaryText}>Create account</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
    avatarBtn: {
      paddingVertical: 2,
      zIndex: 61,
    },
    navAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    navAvatarGuest: {
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navAvatarText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.sm,
    },
    navAvatarGuestText: {
      color: colors.textPrimary,
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

    drawerRoot: {
      flex: 1,
    },
    drawerScrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    drawerPanel: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      bottom: 0,
      borderRightWidth: StyleSheet.hairlineWidth,
      zIndex: 2,
      elevation: 8,
    },
    drawerScroll: {
      paddingBottom: 12,
      flexGrow: 1,
    },
    xHeader: {
      paddingHorizontal: 24,
      paddingTop: 6,
      paddingBottom: 14,
    },
    xAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: 10,
    },
    xAvatarGuest: {
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    xAvatarText: {
      color: '#fff',
      fontWeight: fontWeight.extrabold,
      fontSize: typography.xl,
    },
    xAvatarGuestText: {
      color: colors.textPrimary,
    },
    xDisplayName: {
      color: colors.textPrimary,
      fontWeight: fontWeight.extrabold,
      fontSize: 20,
      letterSpacing: -0.3,
    },
    xHandle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 2,
    },
    xHairline: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    xNavBlock: {
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    xNavBlockCompact: {
      paddingVertical: 0,
      paddingHorizontal: 6,
      paddingBottom: 2,
    },
    xSectionLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: fontWeight.bold,
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 2,
    },
    xRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 14,
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: radius.md,
    },
    xRowCompact: {
      paddingVertical: 8,
      gap: 12,
    },
    xRowLabel: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: fontWeight.bold,
      letterSpacing: -0.2,
    },
    xRowLabelCompact: {
      fontSize: 15,
      fontWeight: fontWeight.semibold,
    },
    listsBlock: {
      paddingLeft: 10,
      paddingBottom: 4,
    },
    listItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
      paddingVertical: 9,
      paddingHorizontal: 18,
      borderRadius: radius.md,
    },
    listItemActive: {
      backgroundColor: colors.bgPressed,
    },
    listDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },
    listItemText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: fontWeight.medium,
      flex: 1,
    },
    listItemTextActive: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
    },
    guestCtaWrap: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 6,
      gap: 8,
      alignItems: 'center' as const,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    guestCta: {
      backgroundColor: colors.textPrimary,
      borderRadius: radius.full,
      paddingVertical: 13,
      alignItems: 'center' as const,
      width: '100%' as const,
    },
    guestCtaText: {
      color: colors.bg,
      fontWeight: fontWeight.bold,
      fontSize: 16,
    },
    guestSecondary: {
      paddingVertical: 4,
    },
    guestSecondaryText: {
      color: colors.accent,
      fontWeight: fontWeight.semibold,
      fontSize: 14,
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
