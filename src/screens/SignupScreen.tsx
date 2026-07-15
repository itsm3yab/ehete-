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
import { useApp } from '../store/AppContext';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';

export default function SignupScreen({ navigation }: any) {
  const styles = useThemedStyles(makeSignupStyles);
  const colors = useColors();
  const { dispatch } = useApp();

  const handleGoogle = () => {
    dispatch({ type: 'LOGIN', payload: 'User' });
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubbles" size={40} color={colors.accent} />
        </View>
        <Text style={styles.heading}>Join the Brotherhood</Text>
        <Text style={styles.sub}>
          A community of men who keep it real. Sign up in seconds with your Google account.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
          onPress={handleGoogle}
        >
          <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
          <Text style={styles.googleBtnText}>Sign up with Google</Text>
        </Pressable>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}



function makeSignupStyles(colors: ColorPalette) {
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
  heading: {
    fontSize: typography.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  switchText: { color: colors.textSecondary, fontSize: typography.sm },
  switchLink: { color: colors.accent, fontWeight: fontWeight.semibold, fontSize: typography.sm },
};
}
