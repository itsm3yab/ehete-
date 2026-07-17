import { Platform } from 'react-native';
import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import { usePrefs } from './preferences';

export type ColorPalette = {
  bg: string;
  bgCard: string;
  bgElevated: string;
  bgDrawer: string;
  bgInput: string;
  bgPressed: string;
  border: string;
  borderSubtle: string;
  accent: string;
  accentDim: string;
  accentHover: string;
  textPrimary: string;
  textSecondary: string;
  textMeta: string;
  textInverse: string;
  upvote: string;
  upvoteDim: string;
  downvote: string;
  downvoteDim: string;
  voteDefault: string;
  navIconActive: string;
  navIcon: string;
  skeleton: string;
  skeletonShimmer: string;
  danger: string;
  dangerDim: string;
  success: string;
  successDim: string;
  warning: string;
};

/** Soft rose night — feminine without harsh pure black */
export const darkColors: ColorPalette = {
  bg: '#140910',
  bgCard: '#1c1018',
  bgElevated: '#271520',
  bgDrawer: '#1a0e16',
  bgInput: '#2e1824',
  bgPressed: '#321c28',
  border: '#3d2433',
  borderSubtle: '#2a1622',
  accent: '#f472b6',
  accentDim: '#3b1529',
  accentHover: '#fb8dc5',
  textPrimary: '#fdf2f8',
  textSecondary: '#c4a0b4',
  textMeta: '#8a6578',
  textInverse: '#1a0a12',
  upvote: '#fb7185',
  upvoteDim: '#3f1220',
  downvote: '#fb923c',
  downvoteDim: '#3a1c0a',
  voteDefault: '#9a7a8a',
  navIconActive: '#fdf2f8',
  navIcon: '#9a7a8a',
  skeleton: '#24131c',
  skeletonShimmer: '#321c28',
  danger: '#fb7185',
  dangerDim: '#3f1220',
  success: '#34d399',
  successDim: '#0a2a1e',
  warning: '#fbbf24',
};

/** Pure pitch white day */
export const lightColors: ColorPalette = {
  bg: '#ffffff',
  bgCard: '#ffffff',
  bgElevated: '#ffffff',
  bgDrawer: '#ffffff',
  bgInput: '#ffffff',
  bgPressed: '#ffffff',
  border: '#f0f0f0',
  borderSubtle: '#f5f5f5',
  accent: '#e11d6a',
  accentDim: '#fff0f6',
  accentHover: '#be185d',
  textPrimary: '#3b1024',
  textSecondary: '#8b5a72',
  textMeta: '#b07a94',
  textInverse: '#ffffff',
  upvote: '#e11d6a',
  upvoteDim: '#fff0f6',
  downvote: '#ea580c',
  downvoteDim: '#fff7ed',
  voteDefault: '#b07a94',
  navIconActive: '#e11d6a',
  navIcon: '#c48aa3',
  skeleton: '#ffffff',
  skeletonShimmer: '#ffffff',
  danger: '#e11d48',
  dangerDim: '#fff1f2',
  success: '#059669',
  successDim: '#ecfdf5',
  warning: '#d97706',
};

/** Module default is light so StyleSheet.create captures readable light colors. */
export let colors: ColorPalette = lightColors;

export function getColors(mode: 'dark' | 'light'): ColorPalette {
  return mode === 'light' ? lightColors : darkColors;
}

type ThemeContextValue = {
  mode: 'dark' | 'light';
  colors: ColorPalette;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { prefs } = usePrefs();
  const mode: 'dark' | 'light' = prefs.themeMode === 'dark' ? 'dark' : 'light';
  // Stable palette identity — never recreate the color object
  const palette = mode === 'light' ? lightColors : darkColors;
  colors = palette;

  const value = useMemo(
    () => ({ mode, colors: palette, isDark: mode === 'dark' }),
    [mode, palette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  return useContext(ThemeContext).colors;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  full: 9999,
};

export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  hero: 52,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const categoryThemeDark: Record<string, { bg: string; text: string; dot: string }> = {
  'Mental Health': { bg: '#2a1830', text: '#e9a8f0', dot: '#d946ef' },
  Love: { bg: '#3a1228', text: '#fda4c8', dot: '#f472b6' },
  'Love/Cheating': { bg: '#3a1228', text: '#fda4c8', dot: '#f472b6' },
  Work: { bg: '#2d1e10', text: '#fcd34d', dot: '#f59e0b' },
  Family: { bg: '#142820', text: '#6ee7b7', dot: '#34d399' },
  Friendship: { bg: '#1a2038', text: '#a5b4fc', dot: '#818cf8' },
  'School & College': { bg: '#2d1808', text: '#fdba74', dot: '#fb923c' },
  'Finance & Money': { bg: '#1c2410', text: '#bef264', dot: '#a3e635' },
  'Health & Wellness': { bg: '#102428', text: '#5eead4', dot: '#2dd4bf' },
  Technology: { bg: '#1a1830', text: '#c4b5fd', dot: '#a78bfa' },
  Other: { bg: '#281420', text: '#f9a8d4', dot: '#ec4899' },
};

export const categoryThemeLight: Record<string, { bg: string; text: string; dot: string }> = {
  'Mental Health': { bg: '#ffffff', text: '#a21caf', dot: '#c026d3' },
  Love: { bg: '#ffffff', text: '#be185d', dot: '#ec4899' },
  'Love/Cheating': { bg: '#ffffff', text: '#be185d', dot: '#ec4899' },
  Work: { bg: '#ffffff', text: '#b45309', dot: '#f59e0b' },
  Family: { bg: '#ffffff', text: '#047857', dot: '#10b981' },
  Friendship: { bg: '#ffffff', text: '#6d28d9', dot: '#8b5cf6' },
  'School & College': { bg: '#ffffff', text: '#c2410c', dot: '#f97316' },
  'Finance & Money': { bg: '#ffffff', text: '#4d7c0f', dot: '#84cc16' },
  'Health & Wellness': { bg: '#ffffff', text: '#0f766e', dot: '#14b8a6' },
  Technology: { bg: '#ffffff', text: '#6d28d9', dot: '#8b5cf6' },
  Other: { bg: '#ffffff', text: '#be185d', dot: '#ec4899' },
};

/** @deprecated use getCategoryTheme(name, mode) — kept for dark default */
export const categoryTheme = categoryThemeDark;

export function getCategoryPalette(mode: 'dark' | 'light') {
  return mode === 'light' ? categoryThemeLight : categoryThemeDark;
}

export const shadow = Platform.select({
  ios: {
    shadowColor: '#e11d6a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  android: { elevation: 3 },
  default: {},
});
