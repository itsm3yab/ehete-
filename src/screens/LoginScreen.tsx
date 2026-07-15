import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useApp } from '../store/AppContext';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';

export default function LoginScreen({ navigation }: any) {
  const styles = useThemedStyles(makeLoginStyles);
  const colors = useColors();
  const { dispatch } = useApp();

  const goMain = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
    );
  };

  const handleGoogle = () => {
    dispatch({ type: 'LOGIN', payload: 'User' });
    goMain();
  };

  const handleGuest = () => {
    goMain();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else goMain();
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubbles" size={40} color={colors.accent} />
        </View>
        <Text style={styles.sub}>
          Sign in to share your story, connect with other men, and speak freely.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
          onPress={handleGoogle}
        >
          <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
          <Text style={styles.googleBtnText}>Sign in with Google</Text>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </SafeAreaView>
  );
}



function makeLoginStyles(colors: ColorPalette) {
  return {
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  sub: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
    paddingHorizontal: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    width: '100%',
  },
  googleBtnText: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: typography.base,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  guestText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    fontWeight: fontWeight.medium,
  },
  disclaimer: {
    color: colors.textMeta,
    fontSize: typography.xs,
    textAlign: 'center',
    paddingBottom: 4,
  },
};
}
