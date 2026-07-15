import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Confession, Reply, SortMode } from '../types';
import { mockConfessions } from '../data/mockConfessions';
import { mockReplies } from '../data/mockReplies';

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  isLoggedIn: boolean;
  username: string;
  confessions: Confession[];
  replies: Reply[];
  isLoading: boolean;
  sortMode: SortMode;
  selectedCategory: string | null;
  upvotedIds: Set<string>;
  downvotedIds: Set<string>;
  savedIds: Set<string>;
  upvotedReplyIds: Set<string>;
  downvotedReplyIds: Set<string>;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_SORT'; payload: SortMode }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'ADD_CONFESSION'; payload: Confession }
  | { type: 'DELETE_CONFESSION'; payload: string }
  | { type: 'TOGGLE_UPVOTE'; payload: string }
  | { type: 'TOGGLE_DOWNVOTE'; payload: string }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'ADD_REPLY'; payload: Reply }
  | { type: 'TOGGLE_REPLY_UPVOTE'; payload: string }
  | { type: 'TOGGLE_REPLY_DOWNVOTE'; payload: string };

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
        isLoading: false,
      };

    case 'LOGIN':
      return { ...state, isLoggedIn: true, username: action.payload };

    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        username: '',
        upvotedIds: new Set(),
        downvotedIds: new Set(),
        savedIds: new Set(),
      };

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

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const initialState: AppState = {
  isLoggedIn: true,
  username: 'cool_user123',
  confessions: [],
  replies: [],
  isLoading: true,
  sortMode: 'new',
  selectedCategory: null,
  upvotedIds: new Set(),
  downvotedIds: new Set(),
  savedIds: new Set(),
  upvotedReplyIds: new Set(),
  downvotedReplyIds: new Set(),
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'LOAD_DATA' });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
