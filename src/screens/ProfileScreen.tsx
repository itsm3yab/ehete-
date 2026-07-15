import React from 'react';
import {
  Alert,
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
import { colors, typography, fontWeight, radius } from '../store/theme';
import { formatCount } from '../components/utils';

export default function ProfileScreen({ navigation }: any) {
  const { state, dispatch } = useApp();

  if (!state.isLoggedIn) {
    return (
      <SafeAreaView style={styles.guestSafe} edges={['top']}>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconWrap}>
            <Ionicons name="person-outline" size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.guestTitle}>You're browsing as a guest</Text>
          <Text style={styles.guestSub}>
            Sign in to post confessions, track karma, and save your favorites.
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.createText}>Create a free account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { username } = state;
  const initial = username.charAt(0).toUpperCase();
  const myConfessions = state.confessions.filter((c) => c.authorId === username);
  const karma = myConfessions.reduce((s, c) => s + c.upvotes - c.downvotes, 0);
  const totalReplies = myConfessions.reduce((s, c) => s + c.replyCount, 0);
  const savedCount = state.savedIds.size;

  const handleLogout = () => {
    Alert.alert('Sign Out?', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'LOGOUT' });
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cover */}
        <View style={styles.cover}>
          <View style={styles.coverGradient} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.handle}>@{username.toLowerCase().replace(/\s/g, '_')}</Text>
          <Text style={styles.bio}>Anonymous confessor · Member</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {[
            { label: 'Confessions', value: myConfessions.length, icon: 'document-text-outline' },
            { label: 'Karma', value: karma, icon: 'trending-up-outline' },
            { label: 'Replies', value: totalReplies, icon: 'chatbubble-outline' },
          ].map(({ label, value, icon }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.stat}>
                <Ionicons name={icon as any} size={16} color={colors.textSecondary} />
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
              sublabel={`${myConfessions.length} posts`}
              onPress={() => navigation.navigate('MyConfessions')}
            />
            <MenuDivider />
            <MenuItem
              icon="bookmark-outline"
              label="Saved"
              sublabel={`${savedCount} saved`}
              onPress={() => navigation.navigate('Saved')}
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
              icon="settings-outline"
              label="Settings"
              sublabel="Coming soon"
              onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
            />
            <MenuDivider />
            <MenuItem
              icon="information-circle-outline"
              label="About Etete"
              sublabel="v1.0.0"
              onPress={() => Alert.alert('About Etete', 'Built with Expo & React Native.')}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={19} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  return <View style={styles.menuDivider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 48 },
  // Guest
  guestSafe: { flex: 1, backgroundColor: colors.bg },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  guestIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  guestTitle: { color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: typography.xl, textAlign: 'center' },
  guestSub: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center', lineHeight: 22 },
  signInBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 44,
    paddingVertical: 14,
    borderRadius: radius.full,
    marginTop: 4,
  },
  signInText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: typography.base },
  createText: { color: colors.accent, fontSize: typography.sm, fontWeight: fontWeight.medium },
  // Cover
  cover: {
    height: 120,
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accentDim,
    opacity: 0.5,
  },
  // Avatar
  avatarRow: { paddingHorizontal: 20, marginTop: -36 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.bg,
  },
  avatarText: { color: '#fff', fontWeight: fontWeight.extrabold, fontSize: typography.xxl },
  // User info
  userInfo: { paddingHorizontal: 20, marginTop: 10, gap: 2 },
  username: { color: colors.textPrimary, fontWeight: fontWeight.extrabold, fontSize: typography.xl },
  handle: { color: colors.textSecondary, fontSize: typography.sm },
  bio: { color: colors.textMeta, fontSize: typography.xs, marginTop: 4 },
  // Stats
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
  // Menu
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
  // Logout
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
});
