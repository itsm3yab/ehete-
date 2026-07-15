import { getCategoryPalette, categoryThemeLight } from '../store/theme';

export function formatCount(n: number): string {
  if (n <= 0) return '0';
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  const m = n / 1_000_000;
  return m % 1 === 0 ? `${m}m` : `${m.toFixed(1)}m`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 52) return `${w}w`;
  return `${Math.floor(w / 52)}y`;
}

export function categoryInitial(cat: string): string {
  return cat.charAt(0).toUpperCase();
}

export function categoryColor(cat: string, mode: 'dark' | 'light' = 'light'): string {
  return getCategoryPalette(mode)[cat]?.dot ?? '#1d9bf0';
}

export function getCategoryTheme(cat: string, mode: 'dark' | 'light' = 'light') {
  const palette = getCategoryPalette(mode);
  return palette[cat] ?? categoryThemeLight.Other;
}

export function estimatedViews(upvotes: number, downvotes: number, replyCount: number): number {
  return Math.max(upvotes + downvotes, 0) * 7 + replyCount * 3 + 12;
}
