import { Platform } from 'react-native';

export const colors = {
  // Backgrounds
  bg: '#000000',
  bgCard: '#0a0a0a',
  bgElevated: '#151515',
  bgDrawer: '#0d0d0d',
  bgInput: '#1a1a1a',
  bgPressed: '#1c1c1c',

  // Borders
  border: '#252525',
  borderSubtle: '#1a1a1a',

  // Brand
  accent: '#1d9bf0',
  accentDim: '#0d2a3f',
  accentHover: '#1a8cd8',

  // Text
  textPrimary: '#e7e9ea',
  textSecondary: '#6e767d',
  textMeta: '#3f4447',
  textInverse: '#000000',

  // Voting
  upvote: '#f91880',
  upvoteDim: '#3a0a1e',
  downvote: '#ff6315',
  downvoteDim: '#3a1500',
  voteDefault: '#536471',

  // Nav
  navIconActive: '#e7e9ea',
  navIcon: '#536471',

  // Skeleton
  skeleton: '#181818',
  skeletonShimmer: '#242424',

  // Status
  danger: '#f4212e',
  dangerDim: '#2d0608',
  success: '#00ba7c',
  successDim: '#001f16',
  warning: '#ffb547',
};

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

// Category pill colors — each has a bg tint + text color
export const categoryTheme: Record<string, { bg: string; text: string; dot: string }> = {
  'Mental Health': { bg: '#2a1a3e', text: '#c084fc', dot: '#7c3aed' },
  Love:           { bg: '#3a1128', text: '#f472b6', dot: '#ec4899' },
  Work:           { bg: '#2d1e00', text: '#fbbf24', dot: '#f59e0b' },
  Family:         { bg: '#0d2818', text: '#34d399', dot: '#10b981' },
  Friendship:     { bg: '#0d1f3a', text: '#60a5fa', dot: '#3b82f6' },
  'School & College': { bg: '#2d1400', text: '#fb923c', dot: '#f97316' },
  'Finance & Money':  { bg: '#1a2200', text: '#a3e635', dot: '#84cc16' },
  'Health & Wellness':{ bg: '#001f2d', text: '#22d3ee', dot: '#06b6d4' },
  Technology:     { bg: '#13102e', text: '#818cf8', dot: '#6366f1' },
  Other:          { bg: '#1e0d3a', text: '#a78bfa', dot: '#8b5cf6' },
};

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
