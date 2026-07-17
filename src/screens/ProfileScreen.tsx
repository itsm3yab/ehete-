import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useApp } from '../store/AppContext';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { formatCount } from '../components/utils';
import { useTabBarScroll } from '../navigation/TabBarScrollContext';
import { useAuthGate } from '../components/AuthGate';
import SignOutModal from '../components/SignOutModal';
import { goToSignIn } from '../navigation/navigationRef';

export default function ProfileScreen({ navigation }: any) {
  const styles = useThemedStyles(makeProfileStyles);
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { onScroll } = useTabBarScroll();
  const { requireAuth } = useAuthGate();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const isGuest = !state.isLoggedIn;

  const username = isGuest ? 'Guest' : state.username;
  const initial = username.charAt(0).toUpperCase();
  const myConfessions = isGuest
    ? []
    : state.confessions.filter((c) => c.authorId === username);
  const karma = myConfessions.reduce((s, c) => s + c.upvotes - c.downvotes, 0);
  const totalReplies = myConfessions.reduce((s, c) => s + c.replyCount, 0);
  const savedCount = isGuest ? 0 : state.savedIds.size;

  const confirmLogout = () => {
    setSignOutOpen(false);
    dispatch({ type: 'LOGOUT' });
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }));
  };

  const openAuthed = (screen: string, reason: string) => {
    if (!requireAuth(reason)) return;
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {isGuest && (
          <View style={styles.signInBanner}>
            <View style={styles.signInBannerText}>
              <Text style={styles.signInBannerTitle}>You're browsing as a guest</Text>
              <Text style={styles.signInBannerSub}>
                Sign in to like, reply, save, and post.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bannerSignInBtn}
              onPress={() => goToSignIn()}
              accessibilityRole="button"
            >
              <Text style={styles.bannerSignInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, isGuest && styles.avatarGuest]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          {isGuest && (
            <View style={styles.guestPill}>
              <Text style={styles.guestPillText}>Guest</Text>
            </View>
          )}
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.handle}>
            {isGuest ? '@guest' : `@${username.toLowerCase().replace(/\s/g, '_')}`}
          </Text>
          <Text style={styles.bio}>
            {isGuest ? 'Sign in to unlock your full profile' : 'A sisterhood of honest women'}
          </Text>
        </View>

        {isGuest && (
          <View style={styles.guestActions}>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => goToSignIn()}
              accessibilityRole="button"
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsCard}>
          {[
            { label: 'Confessions', value: myConfessions.length },
            { label: 'Karma', value: karma },
            { label: 'Replies', value: totalReplies },
          ].map(({ label, value }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.stat}>
                <Text style={styles.statNum}>{formatCount(value)}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionLabel}>My Content</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="document-text-outline"
              label="My Confessions"
              sublabel={isGuest ? 'Sign in to view' : `${myConfessions.length} posts`}
              onPress={() =>
                openAuthed('MyConfessions', 'Sign in to view your confessions.')
              }
            />
            <MenuDivider />
            <MenuItem
              icon="bookmark-outline"
              label="Saved"
              sublabel={isGuest ? 'Sign in to view' : `${savedCount} saved`}
              onPress={() => openAuthed('Saved', 'Sign in to view saved posts.')}
            />
            <MenuDivider />
            <MenuItem
              icon="bar-chart-outline"
              label="Voting"
              sublabel="Polls from the sisterhood"
              onPress={() => navigation.navigate('Voting')}
            />
            <MenuDivider />
            <MenuItem
              icon="water-outline"
              label="Cycle Tracker"
              sublabel="Simple period calendar"
              onPress={() => {
                const parent = navigation.getParent?.();
                if (parent) parent.navigate('Cycle');
                else navigation.navigate('Cycle');
              }}
            />
            <MenuDivider />
            <MenuItem
              icon="warning-outline"
              label="Sister Alerts"
              sublabel="Warn sisters about unsafe places"
              iconColor={colors.danger}
              onPress={() => {
                const parent = navigation.getParent?.();
                if (parent) parent.navigate('SisterAlerts');
                else navigation.navigate('SisterAlerts');
              }}
            />
            <MenuDivider />
            <MenuItem
              icon="search-circle-outline"
              label="Do You Know Him?"
              sublabel="Ask sisters before you trust him"
              iconColor={colors.accent}
              onPress={() => {
                const parent = navigation.getParent?.();
                if (parent) parent.navigate('KnowHim');
                else navigation.navigate('KnowHim');
              }}
            />
          </View>

          <Text style={styles.menuSectionLabel}>More</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="heart-outline"
              label="Help & Support"
              iconColor={colors.upvote}
              onPress={() => navigation.navigate('HelpSupport')}
            />
            <MenuDivider />
            <MenuItem
              icon="notifications-outline"
              label="Alerts"
              sublabel="Distress signals nearby"
              onPress={() => navigation.navigate('Notifications')}
            />
            <MenuDivider />
            <MenuItem
              icon="options-outline"
              label="Notification settings"
              sublabel="Push, replies, mentions"
              onPress={() => navigation.navigate('NotificationsSettings')}
            />
            <MenuDivider />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy & Safety"
              sublabel="Blocked users, visibility"
              onPress={() => navigation.navigate('PrivacySettings')}
            />
            <MenuDivider />
            <MenuItem
              icon="moon-outline"
              label="Theme/Language"
              sublabel="Dark, light, and language"
              onPress={() => navigation.navigate('AppearanceSettings')}
            />
            <MenuDivider />
            <MenuItem
              icon="information-circle-outline"
              label="About እህቴ"
              sublabel="v1.0.0"
              onPress={() => navigation.navigate('About')}
            />
          </View>
        </View>

        {!isGuest && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setSignOutOpen(true)}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={19} color={colors.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <SignOutModal
        visible={signOutOpen}
        onCancel={() => setSignOutOpen(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  sublabel,
  iconColor,
  onPress,
}: {
  icon: any;
  label: string;
  sublabel?: string;
  iconColor?: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeProfileStyles);
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconWrap, { backgroundColor: (iconColor ?? colors.textSecondary) + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor ?? colors.textSecondary} />
      </View>
      <View style={styles.menuItemBody}>
        <Text style={styles.menuLabel}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMeta} />
    </TouchableOpacity>
  );
}

function MenuDivider() {
  const styles = useThemedStyles(makeProfileStyles);
  return <View style={styles.menuDivider} />;
}



function makeProfileStyles(colors: ColorPalette) {
  return {
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 110 },
  signInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.accentDim,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent + '55',
  },
  signInBannerText: { flex: 1, gap: 2 },
  signInBannerTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: typography.sm,
  },
  signInBannerSub: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    lineHeight: 16,
  },
  bannerSignInBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  bannerSignInText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: typography.sm,
  },
  guestActions: {
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 12,
    alignItems: 'center',
  },
  signInBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 44,
    paddingVertical: 13,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
  },
  signInText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.base },
  createText: { color: colors.accent, fontSize: typography.sm, fontWeight: fontWeight.medium },
  avatarRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.bg,
  },
  avatarGuest: {
    backgroundColor: colors.bgElevated,
  },
  avatarText: { color: '#fff', fontWeight: fontWeight.extrabold, fontSize: typography.xxl },
  guestPill: {
    marginBottom: 8,
    backgroundColor: colors.bgElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  guestPillText: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
  },
  userInfo: { paddingHorizontal: 20, marginTop: 10, gap: 2 },
  username: { color: colors.textPrimary, fontWeight: fontWeight.extrabold, fontSize: typography.xl },
  handle: { color: colors.textSecondary, fontSize: typography.sm },
  bio: { color: colors.textMeta, fontSize: typography.xs, marginTop: 4 },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 3 },
  statNum: { color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: typography.lg },
  statLabel: { color: colors.textSecondary, fontSize: typography.xs },
  statsDivider: { width: 0.5, backgroundColor: colors.border },
  menuSection: { marginTop: 24, paddingHorizontal: 16, gap: 8 },
  menuSectionLabel: {
    color: colors.textMeta,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  menuCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemBody: { flex: 1 },
  menuLabel: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: fontWeight.medium },
  menuSublabel: { color: colors.textMeta, fontSize: typography.xs, marginTop: 1 },
  menuDivider: { height: 0.5, backgroundColor: colors.border, marginLeft: 60 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.danger + '60',
    borderRadius: radius.md,
    backgroundColor: colors.dangerDim,
  },
  logoutText: { color: colors.danger, fontWeight: fontWeight.semibold, fontSize: typography.sm },
};
}
