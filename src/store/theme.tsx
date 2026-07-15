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

export const darkColors: ColorPalette = {
  bg: '#000000',
  bgCard: '#0a0a0a',
  bgElevated: '#151515',
  bgDrawer: '#0d0d0d',
  bgInput: '#1a1a1a',
  bgPressed: '#1c1c1c',
  border: '#252525',
  borderSubtle: '#1a1a1a',
  accent: '#1d9bf0',
  accentDim: '#0d2a3f',
  accentHover: '#1a8cd8',
  textPrimary: '#e7e9ea',
  textSecondary: '#6e767d',
  textMeta: '#3f4447',
  textInverse: '#000000',
  upvote: '#f91880',
  upvoteDim: '#3a0a1e',
  downvote: '#ff6315',
  downvoteDim: '#3a1500',
  voteDefault: '#536471',
  navIconActive: '#e7e9ea',
  navIcon: '#536471',
  skeleton: '#181818',
  skeletonShimmer: '#242424',
  danger: '#f4212e',
  dangerDim: '#2d0608',
  success: '#00ba7c',
  successDim: '#001f16',
  warning: '#ffb547',
};

export const lightColors: ColorPalette = {
  bg: '#ffffff',
  bgCard: '#ffffff',
  bgElevated: '#f2f5f8',
  bgDrawer: '#ffffff',
  bgInput: '#eef2f6',
  bgPressed: '#e8edf2',
  border: '#d0d9e3',
  borderSubtle: '#e8eef4',
  accent: '#1d9bf0',
  accentDim: '#e8f4fc',
  accentHover: '#1a8cd8',
  textPrimary: '#0f1419',
  textSecondary: '#536471',
  textMeta: '#667788',
  textInverse: '#ffffff',
  upvote: '#f91880',
  upvoteDim: '#fce7f3',
  downvote: '#ff6315',
  downvoteDim: '#ffedd5',
  voteDefault: '#536471',
  navIconActive: '#0f1419',
  navIcon: '#6b7a86',
  skeleton: '#e8ecf0',
  skeletonShimmer: '#dde3ea',
  danger: '#dc2626',
  dangerDim: '#fee2e2',
  success: '#059669',
  successDim: '#d1fae5',
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
  const palette = getColors(mode);
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
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
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
  'Mental Health': { bg: '#2a1a3e', text: '#c084fc', dot: '#7c3aed' },
  Love: { bg: '#3a1128', text: '#f472b6', dot: '#ec4899' },
  Work: { bg: '#2d1e00', text: '#fbbf24', dot: '#f59e0b' },
  Family: { bg: '#0d2818', text: '#34d399', dot: '#10b981' },
  Friendship: { bg: '#0d1f3a', text: '#60a5fa', dot: '#3b82f6' },
  'School & College': { bg: '#2d1400', text: '#fb923c', dot: '#f97316' },
  'Finance & Money': { bg: '#1a2200', text: '#a3e635', dot: '#84cc16' },
  'Health & Wellness': { bg: '#001f2d', text: '#22d3ee', dot: '#06b6d4' },
  Technology: { bg: '#13102e', text: '#818cf8', dot: '#6366f1' },
  Other: { bg: '#1e0d3a', text: '#a78bfa', dot: '#8b5cf6' },
};

export const categoryThemeLight: Record<string, { bg: string; text: string; dot: string }> = {
  'Mental Health': { bg: '#f3e8ff', text: '#7c3aed', dot: '#7c3aed' },
  Love: { bg: '#fce7f3', text: '#db2777', dot: '#ec4899' },
  Work: { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
  Family: { bg: '#d1fae5', text: '#059669', dot: '#10b981' },
  Friendship: { bg: '#dbeafe', text: '#2563eb', dot: '#3b82f6' },
  'School & College': { bg: '#ffedd5', text: '#ea580c', dot: '#f97316' },
  'Finance & Money': { bg: '#ecfccb', text: '#65a30d', dot: '#84cc16' },
  'Health & Wellness': { bg: '#cffafe', text: '#0891b2', dot: '#06b6d4' },
  Technology: { bg: '#e0e7ff', text: '#4f46e5', dot: '#6366f1' },
  Other: { bg: '#ede9fe', text: '#7c3aed', dot: '#8b5cf6' },
};

/** @deprecated use getCategoryTheme(name, mode) — kept for dark default */
export const categoryTheme = categoryThemeDark;

export function getCategoryPalette(mode: 'dark' | 'light') {
  return mode === 'light' ? categoryThemeLight : categoryThemeDark;
}

export const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
  default: {},
});
