import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  ColorPalette,
  darkColors,
  lightColors,
  useTheme,
} from './theme';

type StyleFactory = (colors: ColorPalette) => Record<string, any>;

const sheetCache = new WeakMap<StyleFactory, { light: any; dark: any }>();

function getCachedSheets(factory: StyleFactory) {
  let entry = sheetCache.get(factory);
  if (!entry) {
    entry = {
      light: StyleSheet.create(factory(lightColors) as any),
      dark: StyleSheet.create(factory(darkColors) as any),
    };
    sheetCache.set(factory, entry);
  }
  return entry;
}

/**
 * Prebuilds light + dark StyleSheets once per factory, then swaps instantly on theme change.
 * Pass a stable factory defined outside the component.
 */
export function useThemedStyles(factory: StyleFactory): any {
  const { mode } = useTheme();
  return useMemo(() => {
    const sheets = getCachedSheets(factory);
    return mode === 'dark' ? sheets.dark : sheets.light;
  }, [factory, mode]);
}
