import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import {
  Confession,
  Reply,
  SortMode,
  Poll,
  SafetyWarning,
  DistressSignal,
  DistressResponder,
  GuyCheck,
  GuyCheckTip,
} from '../types';
import { mockConfessions } from '../data/mockConfessions';
import { mockReplies } from '../data/mockReplies';
import { mockPolls } from '../data/mockPolls';
import { mockWarnings } from '../data/mockWarnings';
import { mockDistressSignals } from '../data/mockDistress';
import { mockGuyChecks, mockGuyTips } from '../data/mockGuyChecks';

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  isLoggedIn: boolean;
  username: string;
  avatarUri: string | null;
  confessions: Confession[];
  replies: Reply[];
  polls: Poll[];
  warnings: SafetyWarning[];
  distressSignals: DistressSignal[];
  dismissedDistressIds: Set<string>;
  guyChecks: GuyCheck[];
  guyTips: GuyCheckTip[];
  thankedGuyTipIds: Set<string>;
  pollVotes: Record<string, string>;
  isLoading: boolean;
  sortMode: SortMode;
  selectedCategory: string | null;
  upvotedIds: Set<string>;
  downvotedIds: Set<string>;
  savedIds: Set<string>;
  upvotedReplyIds: Set<string>;
  downvotedReplyIds: Set<string>;
  thankedWarningIds: Set<string>;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: string }
  | { type: 'LOGOUT' }
  | {
      type: 'UPDATE_PROFILE';
      payload: { username?: string; avatarUri?: string | null };
    }
  | { type: 'SET_SORT'; payload: SortMode }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'ADD_CONFESSION'; payload: Confession }
  | { type: 'DELETE_CONFESSION'; payload: string }
  | { type: 'PURGE_EXPIRED' }
  | { type: 'TOGGLE_UPVOTE'; payload: string }
  | { type: 'TOGGLE_DOWNVOTE'; payload: string }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'ADD_REPLY'; payload: Reply }
  | { type: 'TOGGLE_REPLY_UPVOTE'; payload: string }
  | { type: 'TOGGLE_REPLY_DOWNVOTE'; payload: string }
  | { type: 'ADD_POLL'; payload: Poll }
  | { type: 'VOTE_POLL'; payload: { pollId: string; optionId: string } }
  | { type: 'ADD_WARNING'; payload: SafetyWarning }
  | { type: 'TOGGLE_WARNING_HELPFUL'; payload: string }
  | { type: 'ADD_DISTRESS'; payload: DistressSignal }
  | { type: 'RESOLVE_DISTRESS'; payload: string }
  | {
      type: 'ADD_DISTRESS_RESPONDER';
      payload: { distressId: string; responder: DistressResponder };
    }
  | { type: 'DISMISS_DISTRESS_VIEW'; payload: string }
  | { type: 'ADD_GUY_CHECK'; payload: GuyCheck }
  | { type: 'ADD_GUY_TIP'; payload: GuyCheckTip }
  | { type: 'TOGGLE_GUY_TIP_HELPFUL'; payload: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggleSet(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function updateConfessionVote(
  confessions: Confession[],
  id: string,
  upvotedIds: Set<string>,
  downvotedIds: Set<string>
): Confession[] {
  return confessions.map((c) => {
    if (c.id !== id) return c;
    return { ...c }; // votes computed from sets in components
  });
}

function insertReplyIntoTree(replies: Reply[], newReply: Reply): Reply[] {
  return replies.map((r) => {
    if (r.id === newReply.parentReplyId) {
      return { ...r, replies: [...r.replies, newReply] };
    }
    if (r.replies.length > 0) {
      return { ...r, replies: insertReplyIntoTree(r.replies, newReply) };
    }
    return r;
  });
}

function updateReplyVotes(
  replies: Reply[],
  id: string,
  field: 'upvotes' | 'downvotes',
  delta: number
): Reply[] {
  return replies.map((r) => {
    if (r.id === id) return { ...r, [field]: r[field] + delta };
    if (r.replies.length > 0)
      return { ...r, replies: updateReplyVotes(r.replies, id, field, delta) };
    return r;
  });
}

function remapReplyAuthors(replies: Reply[], from: string, to: string): Reply[] {
  return replies.map((r) => ({
    ...r,
    authorId: r.authorId === from ? to : r.authorId,
    replies: r.replies.length > 0 ? remapReplyAuthors(r.replies, from, to) : r.replies,
  }));
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_DATA':
      return {
        ...state,
        confessions: mockConfessions.map((c) => ({ ...c })),
        replies: mockReplies.map((r) => ({ ...r })),
        polls: mockPolls.map((p) => ({
          ...p,
          options: p.options.map((o) => ({ ...o })),
        })),
        warnings: mockWarnings.map((w) => ({ ...w })),
        guyChecks: mockGuyChecks.map((g) => ({ ...g })),
        guyTips: mockGuyTips.map((t) => ({ ...t })),
        distressSignals:
          state.distressSignals.length > 0
            ? state.distressSignals
            : mockDistressSignals.map((d) => ({
                ...d,
                responders: d.responders.map((r) => ({ ...r })),
              })),
        isLoading: false,
      };

    case 'LOGIN':
      return { ...state, isLoggedIn: true, username: action.payload };

    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        username: '',
        avatarUri: null,
        upvotedIds: new Set(),
        downvotedIds: new Set(),
        savedIds: new Set(),
        pollVotes: {},
        thankedWarningIds: new Set(),
      };

    case 'UPDATE_PROFILE': {
      if (!state.isLoggedIn) return state;
      const nextName = (action.payload.username ?? state.username).trim();
      if (!nextName) return state;
      const nextAvatar =
        action.payload.avatarUri !== undefined
          ? action.payload.avatarUri
          : state.avatarUri;
      const oldName = state.username;
      const rename = oldName && oldName !== nextName;

      return {
        ...state,
        username: nextName,
        avatarUri: nextAvatar,
        confessions: rename
          ? state.confessions.map((c) =>
              c.authorId === oldName ? { ...c, authorId: nextName } : c
            )
          : state.confessions,
        replies: rename
          ? remapReplyAuthors(state.replies, oldName, nextName)
          : state.replies,
        polls: rename
          ? state.polls.map((p) =>
              p.authorId === oldName ? { ...p, authorId: nextName } : p
            )
          : state.polls,
        warnings: rename
          ? state.warnings.map((w) =>
              w.authorId === oldName ? { ...w, authorId: nextName } : w
            )
          : state.warnings,
      };
    }

    case 'SET_SORT':
      return { ...state, sortMode: action.payload };

    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'ADD_CONFESSION':
      return { ...state, confessions: [action.payload, ...state.confessions] };

    case 'DELETE_CONFESSION':
      return {
        ...state,
        confessions: state.confessions.filter((c) => c.id !== action.payload),
      };

    case 'PURGE_EXPIRED': {
      const now = Date.now();
      const next = state.confessions.filter(
        (c) => !(typeof c.expiresAt === 'number' && c.expiresAt <= now)
      );
      if (next.length === state.confessions.length) return state;
      return { ...state, confessions: next };
    }

    case 'TOGGLE_UPVOTE': {
      const id = action.payload;
      const confession = state.confessions.find((c) => c.id === id);
      if (!confession) return state;
      const wasUpvoted = state.upvotedIds.has(id);
      const wasDownvoted = state.downvotedIds.has(id);
      const newUpvoted = new Set(state.upvotedIds);
      const newDownvoted = new Set(state.downvotedIds);

      let upDelta = 0;
      let downDelta = 0;

      if (wasUpvoted) {
        newUpvoted.delete(id);
        upDelta = -1;
      } else {
        newUpvoted.add(id);
        upDelta = 1;
        if (wasDownvoted) {
          newDownvoted.delete(id);
          downDelta = -1;
        }
      }

      return {
        ...state,
        upvotedIds: newUpvoted,
        downvotedIds: newDownvoted,
        confessions: state.confessions.map((c) =>
          c.id === id
            ? { ...c, upvotes: c.upvotes + upDelta, downvotes: c.downvotes + downDelta }
            : c
        ),
      };
    }

    case 'TOGGLE_DOWNVOTE': {
      const id = action.payload;
      const confession = state.confessions.find((c) => c.id === id);
      if (!confession) return state;
      const wasUpvoted = state.upvotedIds.has(id);
      const wasDownvoted = state.downvotedIds.has(id);
      const newUpvoted = new Set(state.upvotedIds);
      const newDownvoted = new Set(state.downvotedIds);

      let upDelta = 0;
      let downDelta = 0;

      if (wasDownvoted) {
        newDownvoted.delete(id);
        downDelta = -1;
      } else {
        newDownvoted.add(id);
        downDelta = 1;
        if (wasUpvoted) {
          newUpvoted.delete(id);
          upDelta = -1;
        }
      }

      return {
        ...state,
        upvotedIds: newUpvoted,
        downvotedIds: newDownvoted,
        confessions: state.confessions.map((c) =>
          c.id === id
            ? { ...c, upvotes: c.upvotes + upDelta, downvotes: c.downvotes + downDelta }
            : c
        ),
      };
    }

    case 'TOGGLE_SAVE':
      return { ...state, savedIds: toggleSet(state.savedIds, action.payload) };

    case 'ADD_REPLY': {
      const r = action.payload;
      let newReplies: Reply[];
      if (r.parentReplyId) {
        newReplies = insertReplyIntoTree(state.replies, r);
      } else {
        newReplies = [...state.replies, r];
      }
      return {
        ...state,
        replies: newReplies,
        confessions: state.confessions.map((c) =>
          c.id === r.confessionId ? { ...c, replyCount: c.replyCount + 1 } : c
        ),
      };
    }

    case 'TOGGLE_REPLY_UPVOTE': {
      const id = action.payload;
      const wasUp = state.upvotedReplyIds.has(id);
      const wasDown = state.downvotedReplyIds.has(id);
      const newUp = new Set(state.upvotedReplyIds);
      const newDown = new Set(state.downvotedReplyIds);
      let upDelta = 0;
      let downDelta = 0;
      if (wasUp) { newUp.delete(id); upDelta = -1; }
      else { newUp.add(id); upDelta = 1; if (wasDown) { newDown.delete(id); downDelta = -1; } }
      return {
        ...state,
        upvotedReplyIds: newUp,
        downvotedReplyIds: newDown,
        replies: upDelta !== 0 ? updateReplyVotes(state.replies, id, 'upvotes', upDelta) : state.replies,
      };
    }

    case 'TOGGLE_REPLY_DOWNVOTE': {
      const id = action.payload;
      const wasUp = state.upvotedReplyIds.has(id);
      const wasDown = state.downvotedReplyIds.has(id);
      const newUp = new Set(state.upvotedReplyIds);
      const newDown = new Set(state.downvotedReplyIds);
      let upDelta = 0;
      let downDelta = 0;
      if (wasDown) { newDown.delete(id); downDelta = -1; }
      else { newDown.add(id); downDelta = 1; if (wasUp) { newUp.delete(id); upDelta = -1; } }
      return {
        ...state,
        upvotedReplyIds: newUp,
        downvotedReplyIds: newDown,
        replies:
          downDelta !== 0 || upDelta !== 0
            ? updateReplyVotes(
                upDelta !== 0
                  ? updateReplyVotes(state.replies, id, 'upvotes', upDelta)
                  : state.replies,
                id,
                'downvotes',
                downDelta
              )
            : state.replies,
      };
    }

    case 'ADD_POLL':
      return { ...state, polls: [action.payload, ...state.polls] };

    case 'VOTE_POLL': {
      const { pollId, optionId } = action.payload;
      const poll = state.polls.find((p) => p.id === pollId);
      if (!poll) return state;
      const prev = state.pollVotes[pollId];
      if (prev === optionId) return state;

      return {
        ...state,
        pollVotes: { ...state.pollVotes, [pollId]: optionId },
        polls: state.polls.map((p) => {
          if (p.id !== pollId) return p;
          return {
            ...p,
            options: p.options.map((o) => {
              let votes = o.votes;
              if (o.id === prev) votes = Math.max(0, votes - 1);
              if (o.id === optionId) votes += 1;
              return { ...o, votes };
            }),
          };
        }),
      };
    }

    case 'ADD_WARNING':
      return { ...state, warnings: [action.payload, ...state.warnings] };

    case 'TOGGLE_WARNING_HELPFUL': {
      const id = action.payload;
      const warning = state.warnings.find((w) => w.id === id);
      if (!warning) return state;
      const thanked = state.thankedWarningIds.has(id);
      const nextThanked = new Set(state.thankedWarningIds);
      if (thanked) nextThanked.delete(id);
      else nextThanked.add(id);
      return {
        ...state,
        thankedWarningIds: nextThanked,
        warnings: state.warnings.map((w) =>
          w.id === id
            ? { ...w, helpfulCount: Math.max(0, w.helpfulCount + (thanked ? -1 : 1)) }
            : w
        ),
      };
    }

    case 'ADD_DISTRESS': {
      // Only one active personal distress at a time
      const withoutMine = state.distressSignals.map((d) =>
        d.isMine && d.status === 'active'
          ? { ...d, status: 'resolved' as const, resolvedAt: Date.now() }
          : d
      );
      return { ...state, distressSignals: [action.payload, ...withoutMine] };
    }

    case 'RESOLVE_DISTRESS':
      return {
        ...state,
        distressSignals: state.distressSignals.map((d) =>
          d.id === action.payload
            ? { ...d, status: 'resolved' as const, resolvedAt: Date.now() }
            : d
        ),
      };

    case 'ADD_DISTRESS_RESPONDER': {
      const { distressId, responder } = action.payload;
      return {
        ...state,
        distressSignals: state.distressSignals.map((d) => {
          if (d.id !== distressId || d.status !== 'active') return d;
          if (d.responders.some((r) => r.id === responder.id)) return d;
          // Avoid duplicate "me" responses from same username label in a row
          if (
            responder.label.startsWith('@') &&
            d.responders.some((r) => r.label === responder.label)
          ) {
            return d;
          }
          return { ...d, responders: [...d.responders, responder] };
        }),
      };
    }

    case 'DISMISS_DISTRESS_VIEW': {
      const next = new Set(state.dismissedDistressIds);
      next.add(action.payload);
      return { ...state, dismissedDistressIds: next };
    }

    case 'ADD_GUY_CHECK':
      return { ...state, guyChecks: [action.payload, ...state.guyChecks] };

    case 'ADD_GUY_TIP': {
      const tip = action.payload;
      return {
        ...state,
        guyTips: [tip, ...state.guyTips],
        guyChecks: state.guyChecks.map((g) =>
          g.id === tip.checkId ? { ...g, tipCount: g.tipCount + 1 } : g
        ),
      };
    }

    case 'TOGGLE_GUY_TIP_HELPFUL': {
      const id = action.payload;
      const tip = state.guyTips.find((t) => t.id === id);
      if (!tip) return state;
      const thanked = state.thankedGuyTipIds.has(id);
      const next = new Set(state.thankedGuyTipIds);
      if (thanked) next.delete(id);
      else next.add(id);
      return {
        ...state,
        thankedGuyTipIds: next,
        guyTips: state.guyTips.map((t) =>
          t.id === id
            ? { ...t, helpfulCount: Math.max(0, t.helpfulCount + (thanked ? -1 : 1)) }
            : t
        ),
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const initialState: AppState = {
  isLoggedIn: false,
  username: '',
  avatarUri: null,
  confessions: [],
  replies: [],
  polls: [],
  warnings: [],
  distressSignals: [],
  dismissedDistressIds: new Set(),
  guyChecks: [],
  guyTips: [],
  thankedGuyTipIds: new Set(),
  pollVotes: {},
  isLoading: true,
  sortMode: 'new',
  selectedCategory: null,
  upvotedIds: new Set(),
  downvotedIds: new Set(),
  savedIds: new Set(),
  upvotedReplyIds: new Set(),
  downvotedReplyIds: new Set(),
  thankedWarningIds: new Set(),
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Load mock data on next frame — no artificial 1.2s wait
    const id = requestAnimationFrame(() => {
      dispatch({ type: 'LOAD_DATA' });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Remove self-destruct posts after they expire
  useEffect(() => {
    dispatch({ type: 'PURGE_EXPIRED' });
    const id = setInterval(() => dispatch({ type: 'PURGE_EXPIRED' }), 30_000);
    return () => clearInterval(id);
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
