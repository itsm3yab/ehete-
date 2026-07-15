import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function hapticLight() {
  if (Platform.OS === 'web') return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export function hapticMedium() {
  if (Platform.OS === 'web') return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // ignore
  }
}

export function hapticSelect() {
  if (Platform.OS === 'web') return;
  try {
    Haptics.selectionAsync();
  } catch {
    // ignore
  }
}

export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignore
  }
}
