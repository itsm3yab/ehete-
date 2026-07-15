import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { navigate } from '../navigation/navigationRef';

type AuthGateContextValue = {
  requireAuth: (reason?: string) => boolean;
};

const AuthGateContext = createContext<AuthGateContextValue>({
  requireAuth: () => true,
});

let authGateHandler: ((reason?: string) => boolean) | null = null;

export function promptAuth(reason?: string) {
  if (authGateHandler) return authGateHandler(reason);
  return false;
}

export function useAuthGate() {
  return useContext(AuthGateContext);
}

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Sign in to continue');

  const requireAuth = useCallback(
    (reason?: string) => {
      if (state.isLoggedIn) return true;
      setMessage(reason || 'Sign in to like, reply, and save confessions.');
      setVisible(true);
      return false;
    },
    [state.isLoggedIn]
  );

  useEffect(() => {
    authGateHandler = requireAuth;
    return () => {
      if (authGateHandler === requireAuth) authGateHandler = null;
    };
  }, [requireAuth]);

  const close = () => setVisible(false);

  const goLogin = () => {
    setVisible(false);
    navigate('Auth', { screen: 'Login' });
  };

  const goSignup = () => {
    setVisible(false);
    navigate('Auth', { screen: 'Signup' });
  };

  const value = useMemo(() => ({ requireAuth }), [requireAuth]);

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent={false}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed" size={26} color={colors.accent} />
            </View>
            <Text style={styles.title}>Sign in required</Text>
            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={goLogin}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              <Text style={styles.primaryText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={goSignup}
              accessibilityRole="button"
              accessibilityLabel="Create Account"
            >
              <Text style={styles.outlineText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={close} hitSlop={10}>
              <Text style={styles.dismiss}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AuthGateContext.Provider>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(15,20,25,0.45)',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    sheet: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      paddingHorizontal: 22,
      paddingTop: 26,
      paddingBottom: 20,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 10,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accentDim,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.lg,
      fontWeight: fontWeight.bold,
      textAlign: 'center',
    },
    message: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 6,
    },
    primaryBtn: {
      width: '100%',
      backgroundColor: colors.accent,
      paddingVertical: 14,
      borderRadius: radius.full,
      alignItems: 'center',
      marginTop: 4,
    },
    primaryText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    outlineBtn: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 13,
      borderRadius: radius.full,
      alignItems: 'center',
      backgroundColor: colors.bgElevated,
    },
    outlineText: {
      color: colors.textPrimary,
      fontWeight: fontWeight.semibold,
      fontSize: typography.base,
    },
    dismiss: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      marginTop: 6,
      paddingVertical: 4,
    },
  });
}
