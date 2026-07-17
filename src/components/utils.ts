import { getCategoryPalette, categoryThemeLight } from '../store/theme';
import type { Confession, Poll } from '../types';

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

/** Sidebar stats: vote wins (+10 each) and up/down totals on own posts */
export function getUserSidebarStats(
  confessions: Confession[],
  polls: Poll[],
  pollVotes: Record<string, string>,
  username: string,
  isGuest: boolean
) {
  if (isGuest || !username) {
    return { voteScore: 0, upvotes: 0, downvotes: 0, wins: 0 };
  }

  const mine = confessions.filter((c) => c.authorId === username);
  const upvotes = mine.reduce((s, c) => s + c.upvotes, 0);
  const downvotes = mine.reduce((s, c) => s + c.downvotes, 0);

  let wins = 0;
  for (const poll of polls) {
    const votedId = pollVotes[poll.id];
    if (!votedId) continue;
    const maxVotes = Math.max(0, ...poll.options.map((o) => o.votes));
    if (maxVotes <= 0) continue;
    const mineOpt = poll.options.find((o) => o.id === votedId);
    if (mineOpt && mineOpt.votes === maxVotes) wins += 1;
  }

  return {
    wins,
    voteScore: wins * 10,
    upvotes,
    downvotes,
  };
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
  return getCategoryPalette(mode)[cat]?.dot ?? '#e11d6a';
}

export function getCategoryTheme(cat: string, mode: 'dark' | 'light' = 'light') {
  const palette = getCategoryPalette(mode);
  return palette[cat] ?? categoryThemeLight.Other;
}

export function estimatedViews(upvotes: number, downvotes: number, replyCount: number): number {
  return Math.max(upvotes + downvotes, 0) * 7 + replyCount * 3 + 12;
}

/** Short remaining time for self-destruct posts, e.g. "45m left" */
export function timeLeft(expiresAt: number, now = Date.now()): string {
  const diff = expiresAt - now;
  if (diff <= 0) return 'Expired';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s left`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m left`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h left`;
  const d = Math.floor(h / 24);
  return `${d}d left`;
}

export function isExpired(expiresAt?: number | null, now = Date.now()): boolean {
  return typeof expiresAt === 'number' && expiresAt <= now;
}
