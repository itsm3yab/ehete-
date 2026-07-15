import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAuthGate } from './AuthGate';
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
import { getCategoryTheme, formatCount, getUserSidebarStats } from './utils';
import { navigationRef, goToSignIn } from '../navigation/navigationRef';
import { hapticSelect } from '../utils/haptics';
import SignOutModal from './SignOutModal';

export const DRAWER_W = Math.min(Math.round(Dimensions.get('window').width * 0.82), 320);

type Props = {
  visible: boolean;
  onClose: () => void;
  navigation: any;
};

function openScreen(navigation: any, screen: string) {
  const parent = navigation?.getParent?.();
  const routeNames: string[] | undefined = parent?.getState?.()?.routeNames;
  if (routeNames?.includes('Feed')) {
    parent.navigate('Feed', { screen });
    return;
  }
  navigation.navigate(screen);
}

function DrawerRow({
  icon,
  label,
  onPress,
  compact,
  danger,
  colors,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  compact?: boolean;
  danger?: boolean;
  colors: ColorPalette;
  styles: any;
}) {
  return (
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
        size={compact ? 22 : 26}
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
}

export function DrawerAvatarButton({
  onPress,
  initial,
  isGuest,
}: {
  onPress: () => void;
  initial: string;
  isGuest: boolean;
}) {
  const styles = useThemedStyles(makeAvatarStyles);
  return (
    <TouchableOpacity
      onPress={onPress}
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
  );
}

export default function SideDrawer({ visible, onClose, navigation }: Props) {
  const styles = useThemedStyles(makeDrawerStyles);
  const colors = useColors();
  const { mode, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { requireAuth } = useAuthGate();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const isGuest = !state.isLoggedIn;
  const displayName = isGuest ? 'Guest' : state.username || 'User';
  const handle = isGuest
    ? '@guest'
    : `@${displayName.toLowerCase().replace(/\s/g, '_')}`;
  const initial = displayName.charAt(0).toUpperCase();

  const stats = useMemo(
    () =>
      getUserSidebarStats(
        state.confessions,
        state.polls,
        state.pollVotes,
        state.username,
        isGuest
      ),
    [state.confessions, state.polls, state.pollVotes, state.username, isGuest]
  );

  const go = useCallback(
    (action: () => void) => {
      onClose();
      setTimeout(action, 180);
    },
    [onClose]
  );

  const openAuthed = useCallback(
    (screen: string, reason: string) => {
      go(() => {
        if (!requireAuth(reason)) return;
        openScreen(navigation, screen);
      });
    },
    [go, requireAuth, navigation]
  );

  const handleLogout = useCallback(() => {
    onClose();
    setTimeout(() => setSignOutOpen(true), 180);
  }, [onClose]);

  const confirmLogout = useCallback(() => {
    setSignOutOpen(false);
    dispatch({ type: 'LOGOUT' });
    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })
      );
    }
  }, [dispatch]);

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.drawerRoot}>
        <Pressable style={styles.drawerScrim} onPress={onClose} />
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
              <View style={styles.xHeaderTop}>
                <TouchableOpacity
                  onPress={() => go(() => openScreen(navigation, 'Profile'))}
                  activeOpacity={0.85}
                >
                  <View style={[styles.xAvatar, isGuest && styles.xAvatarGuest]}>
                    <Text style={[styles.xAvatarText, isGuest && styles.xAvatarGuestText]}>
                      {initial}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.xHeaderMeta}>
                  <Text style={styles.xDisplayName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.xHandle} numberOfLines={1}>
                    {handle}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: colors.accent }]}>
                    {formatCount(stats.voteScore)}
                  </Text>
                  <Text style={styles.statLabel}>Vote score</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <View style={styles.statValueRow}>
                    <Ionicons name="arrow-up" size={14} color={colors.upvote} />
                    <Text style={[styles.statValue, { color: colors.upvote }]}>
                      {formatCount(stats.upvotes)}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>Upvotes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <View style={styles.statValueRow}>
                    <Ionicons name="arrow-down" size={14} color={colors.downvote} />
                    <Text style={[styles.statValue, { color: colors.downvote }]}>
                      {formatCount(stats.downvotes)}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>Downvotes</Text>
                </View>
              </View>
            </View>

            <View style={styles.xHairline} />

            <View style={styles.xNavBlock}>
              <DrawerRow
                colors={colors}
                styles={styles}
                icon="person-outline"
                label="Profile"
                onPress={() => go(() => openScreen(navigation, 'Profile'))}
              />
              <DrawerRow
                colors={colors}
                styles={styles}
                icon="document-text-outline"
                label="My Confessions"
                onPress={() =>
                  openAuthed('MyConfessions', 'Sign in to view your confessions.')
                }
              />
              <DrawerRow
                colors={colors}
                styles={styles}
                icon="bookmark-outline"
                label="Saved"
                onPress={() => openAuthed('Saved', 'Sign in to view saved posts.')}
              />
              <TouchableOpacity
                style={styles.xRow}
                onPress={() => setCategoriesOpen((v) => !v)}
                activeOpacity={0.7}
              >
                <Ionicons name="grid-outline" size={26} color={colors.textPrimary} />
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
                        <View style={[styles.listDot, { backgroundColor: theme.dot }]} />
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
                colors={colors}
                styles={styles}
                icon="notifications-outline"
                label="Notifications"
                onPress={() =>
                  go(() => openScreen(navigation, 'NotificationsSettings'))
                }
              />
              <DrawerRow
                compact
                colors={colors}
                styles={styles}
                icon="shield-checkmark-outline"
                label="Privacy & Safety"
                onPress={() => go(() => openScreen(navigation, 'PrivacySettings'))}
              />
              <DrawerRow
                compact
                colors={colors}
                styles={styles}
                icon="moon-outline"
                label="Theme/Language"
                onPress={() => go(() => openScreen(navigation, 'AppearanceSettings'))}
              />
              <DrawerRow
                compact
                colors={colors}
                styles={styles}
                icon="help-circle-outline"
                label="Help & Support"
                onPress={() => go(() => openScreen(navigation, 'HelpSupport'))}
              />
              <DrawerRow
                compact
                colors={colors}
                styles={styles}
                icon="information-circle-outline"
                label="About Etete"
                onPress={() => go(() => openScreen(navigation, 'About'))}
              />
            </View>
          </ScrollView>

          {isGuest ? (
            <View style={styles.guestCtaWrap}>
              <TouchableOpacity
                style={styles.guestCta}
                onPress={() => go(() => goToSignIn())}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
              >
                <Text style={styles.guestCtaText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.signOutWrap}>
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleLogout}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Sign Out"
              >
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
    <SignOutModal
      visible={signOutOpen}
      onCancel={() => setSignOutOpen(false)}
      onConfirm={confirmLogout}
    />
    </>
  );
}

function makeAvatarStyles(colors: ColorPalette) {
  return {
    avatarBtn: {
      paddingVertical: 2,
    },
    navAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
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
      fontSize: typography.base,
    },
    navAvatarGuestText: {
      color: colors.textPrimary,
    },
  };
}

function makeDrawerStyles(colors: ColorPalette) {
  return {
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
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 16,
      gap: 14,
    },
    xHeaderTop: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 14,
    },
    xAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
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
    xHeaderMeta: {
      flex: 1,
      gap: 2,
      minWidth: 0,
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
    },
    statsRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.bgElevated,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 6,
    },
    statCell: {
      flex: 1,
      alignItems: 'center' as const,
      gap: 2,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch' as const,
      backgroundColor: colors.border,
      marginVertical: 2,
    },
    statValueRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 3,
    },
    statValue: {
      color: colors.textPrimary,
      fontWeight: fontWeight.extrabold,
      fontSize: 16,
    },
    statLabel: {
      color: colors.textMeta,
      fontSize: 11,
      fontWeight: fontWeight.medium,
    },
    xHairline: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 6,
    },
    xNavBlock: {
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    xNavBlockCompact: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      paddingBottom: 4,
    },
    xSectionLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: fontWeight.bold,
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 4,
    },
    xRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 14,
      paddingVertical: 13,
      paddingHorizontal: 18,
      borderRadius: radius.md,
    },
    xRowCompact: {
      paddingVertical: 11,
      gap: 12,
    },
    xRowLabel: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: fontWeight.bold,
      letterSpacing: -0.2,
    },
    xRowLabelCompact: {
      fontSize: 17,
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
      paddingVertical: 10,
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
      fontSize: 16,
      fontWeight: fontWeight.medium,
      flex: 1,
    },
    listItemTextActive: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
    },
    guestCtaWrap: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 6,
      gap: 8,
      alignItems: 'center' as const,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    guestCta: {
      backgroundColor: colors.textPrimary,
      borderRadius: radius.full,
      paddingVertical: 14,
      alignItems: 'center' as const,
      width: '100%' as const,
    },
    guestCtaText: {
      color: colors.bg,
      fontWeight: fontWeight.bold,
      fontSize: 17,
    },
    guestSecondary: {
      paddingVertical: 4,
    },
    guestSecondaryText: {
      color: colors.accent,
      fontWeight: fontWeight.semibold,
      fontSize: 15,
    },
    signOutWrap: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    signOutBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      width: '100%' as const,
      paddingVertical: 14,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.danger,
      backgroundColor: colors.dangerDim,
    },
    signOutBtnText: {
      color: colors.danger,
      fontWeight: fontWeight.bold,
      fontSize: 17,
    },
  };
}
