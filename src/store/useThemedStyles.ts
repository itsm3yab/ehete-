import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ColorPalette, useColors, useTheme } from './theme';

type StyleFactory = (colors: ColorPalette) => Record<string, any>;

/**
 * Builds styles from the live palette (no stale cache).
 */
export function useThemedStyles(factory: StyleFactory): any {
  const colors = useColors();
  const { mode } = useTheme();
  return useMemo(
    () => StyleSheet.create(factory(colors) as any),
    [factory, colors, mode]
  );
}
