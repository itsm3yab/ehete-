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

export default function SignupScreen({ navigation }: any) {
  const { dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const passRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const passwordStrength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', colors.danger, colors.warning, colors.success][passwordStrength];

  const handleSignup = () => {
    if (!username.trim()) {
      Alert.alert('Missing username', 'Please choose a username.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
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
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.sub}>Your confessions, your anonymity.</Text>

          <View style={styles.form}>
            {/* Username */}
            <View style={[styles.inputWrap, focused === 'user' && styles.inputFocused]}>
              <Ionicons name="at" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor={colors.textMeta}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                onFocus={() => setFocused('user')}
                onBlur={() => setFocused(null)}
              />
            </View>

            {/* Password */}
            <View>
              <View style={[styles.inputWrap, focused === 'pass' && styles.inputFocused]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={passRef}
                  style={styles.input}
                  placeholder="Password (min 6 chars)"
                  placeholderTextColor={colors.textMeta}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPass((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i <= passwordStrength ? strengthColor : colors.border },
                      ]}
                    />
                  ))}
                  <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
                </View>
              )}
            </View>

            {/* Confirm */}
            <View style={[styles.inputWrap, focused === 'confirm' && styles.inputFocused,
              confirm.length > 0 && confirm !== password && styles.inputError,
            ]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={confirmRef}
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={colors.textMeta}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
              />
              {confirm.length > 0 && (
                <Ionicons
                  name={confirm === password ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={confirm === password ? colors.success : colors.danger}
                />
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
              onPress={handleSignup}
            >
              <Text style={styles.submitText}>Create Account</Text>
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchLink}>Sign In</Text>
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
  inputError: { borderColor: colors.danger },
  inputIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.base,
    padding: 0,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    width: 44,
    textAlign: 'right',
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
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  switchText: { color: colors.textSecondary, fontSize: typography.sm },
  switchLink: { color: colors.accent, fontWeight: fontWeight.semibold, fontSize: typography.sm },
});
