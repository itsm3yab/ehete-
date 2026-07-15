import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ColorPalette, useColors } from './theme';

/**
 * Build StyleSheet from the active theme so light/dark always stay readable.
 * Pass a stable factory defined outside the component.
 */
export function useThemedStyles(
  factory: (colors: ColorPalette) => Record<string, any>
): any {
  const colors = useColors();
  return useMemo(() => StyleSheet.create(factory(colors) as any), [colors]);
}
