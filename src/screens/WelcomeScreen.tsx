import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, fontWeight, radius } from '../store/theme';

export default function WelcomeScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero */}
      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="chatbubbles" size={26} color={colors.accent} />
          </View>
          <Text style={styles.logo}>etete</Text>
        </View>
        <Text style={styles.tagline}>
          A safe space to share what you've been holding inside.
        </Text>
        <View style={styles.pills}>
          {['Anonymous', 'Non-judgmental', 'Honest'].map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && { opacity: 0.85 }]}
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
          accessibilityLabel="Sign In"
        >
          <Text style={styles.btnPrimaryText}>Sign In</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnOutline, pressed && { opacity: 0.75 }]}
          onPress={() => navigation.navigate('Signup')}
          accessibilityRole="button"
          accessibilityLabel="Create Account"
        >
          <Text style={styles.btnOutlineText}>Create Account</Text>
        </Pressable>

        <TouchableOpacity
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          accessibilityRole="button"
          accessibilityLabel="Browse as guest"
        >
          <Text style={styles.guestText}>Browse as Guest</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.disclaimer}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: typography.hero - 10,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    letterSpacing: -1.5,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: typography.md,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    fontWeight: fontWeight.medium,
  },
  actions: {
    gap: 12,
    paddingBottom: 8,
  },
  btn: {
    paddingVertical: 15,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: typography.base,
    letterSpacing: 0.2,
  },
  btnOutline: { borderWidth: 1.5, borderColor: colors.border },
  btnOutlineText: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: typography.base,
  },
  guestText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: typography.sm,
    paddingVertical: 6,
  },
  disclaimer: {
    color: colors.textMeta,
    fontSize: typography.xs,
    textAlign: 'center',
    paddingBottom: 4,
  },
});
