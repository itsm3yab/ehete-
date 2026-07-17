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
  /** When set, the confession is removed after this time */
  expiresAt?: number | null;
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

/** Sister-to-sister place safety warnings */
export type WarningType =
  | 'Harassment'
  | 'Unsafe at night'
  | 'Theft / scam'
  | 'Assault risk'
  | 'Bad transport'
  | 'Other';

export const WARNING_TYPES: WarningType[] = [
  'Harassment',
  'Unsafe at night',
  'Theft / scam',
  'Assault risk',
  'Bad transport',
  'Other',
];

export interface SafetyWarning {
  id: string;
  place: string;
  warningType: WarningType;
  detail: string;
  tip?: string;
  helpfulCount: number;
  timestamp: number;
  authorId: string;
}

export type DistressStatus = 'active' | 'resolved';

export interface DistressResponder {
  id: string;
  label: string;
  message: string;
  timestamp: number;
}

/** Live SOS ping to nearby active sisters */
export interface DistressSignal {
  id: string;
  status: DistressStatus;
  placeLabel: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: number;
  resolvedAt?: number | null;
  authorId: string;
  isMine: boolean;
  notifiedCount: number;
  responders: DistressResponder[];
}

/** Ask sisters: do you know this guy? */
export type GuyConcern =
  | 'Married?'
  | 'Dangerous'
  | 'Serial cheater'
  | 'Scammer'
  | 'Fake identity'
  | 'Just checking';

export const GUY_CONCERNS: GuyConcern[] = [
  'Married?',
  'Dangerous',
  'Serial cheater',
  'Scammer',
  'Fake identity',
  'Just checking',
];

export type GuyTipTag =
  | 'Married / has family'
  | 'Avoid him'
  | 'Known player'
  | 'Scammer'
  | 'Violent / unsafe'
  | 'Seems okay'
  | 'Other tip';

export const GUY_TIP_TAGS: GuyTipTag[] = [
  'Married / has family',
  'Avoid him',
  'Known player',
  'Scammer',
  'Violent / unsafe',
  'Seems okay',
  'Other tip',
];

export interface GuyCheckTip {
  id: string;
  checkId: string;
  tag: GuyTipTag;
  text: string;
  timestamp: number;
  authorId: string;
  helpfulCount: number;
}

export interface GuyCheck {
  id: string;
  nameOrNick: string;
  area: string;
  concern: GuyConcern;
  details: string;
  timestamp: number;
  authorId: string;
  tipCount: number;
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
