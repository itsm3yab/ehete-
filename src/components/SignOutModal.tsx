import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { hapticLight, hapticSelect } from '../utils/haptics';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function SignOutModal({ visible, onCancel, onConfirm }: Props) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          hapticLight();
          onCancel();
        }}
      >
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconRing}>
            <View style={styles.iconInner}>
              <Ionicons name="log-out-outline" size={28} color={colors.danger} />
            </View>
          </View>

          <Text style={styles.title}>Sign out?</Text>
          <Text style={styles.subtitle}>
            You can always come back. Your posts stay anonymous.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
            onPress={() => {
              hapticSelect();
              onConfirm();
            }}
            accessibilityRole="button"
            accessibilityLabel="Confirm sign out"
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.confirmText}>Sign Out</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(colors: ColorPalette) {
  return {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(15, 20, 25, 0.55)',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 28,
    },
    card: {
      width: '100%' as const,
      maxWidth: 340,
      backgroundColor: colors.bgCard,
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingTop: 28,
      paddingBottom: 20,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    iconRing: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.dangerDim,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: 6,
    },
    iconInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.bgElevated,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderColor: colors.danger + '44',
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.xl,
      fontWeight: fontWeight.extrabold,
      letterSpacing: -0.3,
      textAlign: 'center' as const,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      lineHeight: 20,
      textAlign: 'center' as const,
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    confirmBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      width: '100%' as const,
      backgroundColor: colors.danger,
      paddingVertical: 14,
      borderRadius: radius.full,
      marginTop: 4,
    },
    confirmText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.base,
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.98 }],
    },
  };
}
