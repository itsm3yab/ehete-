import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { registerAccount } from '../utils/localAuth';
import { hapticSelect } from '../utils/haptics';

export default function SignupScreen({ navigation }: any) {
  const styles = useThemedStyles(makeSignupStyles);
  const colors = useColors();
  const { dispatch } = useApp();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goMain = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
    );
  };

  const handleSignup = async () => {
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await registerAccount({ username, phone, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      hapticSelect();
      dispatch({ type: 'LOGIN', payload: result.username });
      goMain();
    } finally {
      setLoading(false);
    }
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
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.brand}>እህቴ</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.sub}>
            Join the sisterhood with a username, phone number, and password.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="at-outline" size={18} color={colors.textMeta} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                placeholderTextColor={colors.textMeta}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={24}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone number</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={colors.textMeta} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="09…"
                placeholderTextColor={colors.textMeta}
                keyboardType="phone-pad"
                autoCorrect={false}
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
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMeta}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
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

          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMeta} />
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textMeta}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />
            </View>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9 },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign up</Text>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeSignupStyles(colors: ColorPalette) {
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
    switchRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      marginTop: 28,
      paddingBottom: 8,
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
