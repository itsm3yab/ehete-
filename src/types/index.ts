export interface Confession {
  id: string;
  title: string;
  text: string;
  category: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  timestamp: number;
  authorId: string;
  imageUri?: string | null;
  linkUrl?: string | null;
  hasVoiceNote?: boolean;
}

export interface Reply {
  id: string;
  confessionId: string;
  authorId: string;
  text: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  replies: Reply[];
  parentReplyId?: string | null;
}

export type SortMode = 'new' | 'top' | 'oldest';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  category: string;
  options: PollOption[];
  authorId: string;
  timestamp: number;
  /** When voting opens */
  startAt: number;
  /** When voting closes */
  endAt: number;
}

export const CATEGORIES = [
  'Love/Cheating',
  'Family',
  'Work',
  'Mental Health',
  'Friendship',
  'School & College',
  'Finance & Money',
  'Health & Wellness',
  'Technology',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];
