import React, { useRef, useState } from 'react';
import {
  Alert,
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
import { useApp } from '../store/AppContext';
import { colors, typography, fontWeight, radius } from '../store/theme';

export default function LoginScreen({ navigation }: any) {
  const { dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = () => {
    if (!username.trim()) {
      Alert.alert('Missing username', 'Please enter your username.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Missing password', 'Please enter your password.');
      return;
    }
    dispatch({ type: 'LOGIN', payload: username.trim() });
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to your account</Text>

          <View style={styles.form}>
            {/* Username */}
            <View style={[styles.inputWrap, focused === 'user' && styles.inputFocused]}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textMeta}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                onFocus={() => setFocused('user')}
                onBlur={() => setFocused(null)}
                accessibilityLabel="Username"
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrap, focused === 'pass' && styles.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMeta}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPass((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
              onPress={handleLogin}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              <Text style={styles.submitText}>Sign In</Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
            accessibilityRole="button"
          >
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.switchLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 16 },
  back: { marginBottom: 32, alignSelf: 'flex-start' },
  heading: {
    fontSize: typography.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sub: { color: colors.textSecondary, fontSize: typography.base, marginBottom: 32 },
  form: { gap: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  inputFocused: { borderColor: colors.accent },
  inputIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.base,
    padding: 0,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: typography.base,
    letterSpacing: 0.2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: colors.border },
  dividerText: { color: colors.textSecondary, fontSize: typography.sm },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    marginBottom: 24,
  },
  guestText: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: fontWeight.medium },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: colors.textSecondary, fontSize: typography.sm },
  switchLink: { color: colors.accent, fontWeight: fontWeight.semibold, fontSize: typography.sm },
});
