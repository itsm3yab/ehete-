import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { CommonActions } from '@react-navigation/native';
import { useApp } from '../store/AppContext';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { loginAccount } from '../utils/localAuth';
import { hapticSelect } from '../utils/haptics';

export default function LoginScreen({ navigation }: any) {
  const styles = useThemedStyles(makeLoginStyles);
  const colors = useColors();
  const { dispatch } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goMain = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
    );
  };

  const finishLogin = (username: string) => {
    dispatch({ type: 'LOGIN', payload: username });
    goMain();
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await loginAccount(identifier, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      hapticSelect();
      finishLogin(result.username);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    hapticSelect();
    finishLogin('User');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.back}
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('Welcome');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.brand}>እህቴ</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>
            Sign in with your phone number or username to continue.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Phone or username</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.textMeta} />
              <TextInput
                style={styles.input}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="09… or your username"
                placeholderTextColor={colors.textMeta}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMeta} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.textMeta}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMeta}
                />
              </TouchableOpacity>
            </View>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9 },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
            onPress={handleGoogle}
          >
            <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </Pressable>

          <TouchableOpacity style={styles.guestBtn} onPress={goMain}>
            <Text style={styles.guestText}>Continue as guest</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.switchLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeLoginStyles(colors: ColorPalette) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: { flex: 1 },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 28,
      flexGrow: 1,
    },
    back: {
      alignSelf: 'flex-start' as const,
      paddingVertical: 10,
      marginBottom: 8,
    },
    brand: {
      color: colors.accent,
      fontSize: typography.sm,
      fontWeight: fontWeight.bold,
      marginBottom: 10,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: fontWeight.extrabold,
      letterSpacing: -0.4,
      marginBottom: 8,
    },
    sub: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      lineHeight: 21,
      marginBottom: 28,
    },
    field: {
      marginBottom: 16,
      gap: 8,
    },
    label: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      fontWeight: fontWeight.semibold,
    },
    inputWrap: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.base,
      paddingVertical: Platform.OS === 'ios' ? 0 : 10,
    },
    error: {
      color: colors.danger,
      fontSize: typography.sm,
      marginBottom: 12,
    },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center' as const,
      marginTop: 8,
    },
    primaryBtnText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    divider: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
      marginVertical: 22,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textMeta,
      fontSize: typography.sm,
    },
    googleBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 10,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    googleBtnText: {
      color: colors.textPrimary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.base,
    },
    guestBtn: {
      alignItems: 'center' as const,
      paddingVertical: 16,
    },
    guestText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      fontWeight: fontWeight.medium,
    },
    switchRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      marginTop: 'auto' as const,
      paddingTop: 12,
    },
    switchText: {
      color: colors.textSecondary,
      fontSize: typography.sm,
    },
    switchLink: {
      color: colors.accent,
      fontWeight: fontWeight.semibold,
      fontSize: typography.sm,
    },
  };
}
