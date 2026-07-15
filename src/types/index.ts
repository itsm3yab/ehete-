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

export const CATEGORIES = [
  'Love',
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
