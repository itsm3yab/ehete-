import { Poll } from '../types';

const hour = 60 * 60 * 1000;
const now = Date.now();

export const mockPolls: Poll[] = [
  {
    id: 'p1',
    question: 'Should men talk about their feelings more openly?',
    options: [
      { id: 'p1a', text: 'Yes, always', votes: 148 },
      { id: 'p1b', text: 'Sometimes', votes: 92 },
      { id: 'p1c', text: 'Only with close friends', votes: 61 },
    ],
    authorId: 'Anon',
    timestamp: now - 2 * hour,
    startAt: now - 2 * hour,
    endAt: now + 22 * hour,
  },
  {
    id: 'p2',
    question: "What's harder to admit?",
    options: [
      { id: 'p2a', text: 'Being lonely', votes: 203 },
      { id: 'p2b', text: 'Being wrong', votes: 117 },
      { id: 'p2c', text: 'Needing help', votes: 176 },
    ],
    authorId: 'Brother42',
    timestamp: now - 8 * hour,
    startAt: now - 8 * hour,
    endAt: now + 16 * hour,
  },
  {
    id: 'p3',
    question: 'Would you rather keep a secret forever or confess anonymously?',
    options: [
      { id: 'p3a', text: 'Keep it forever', votes: 44 },
      { id: 'p3b', text: 'Confess anonymously', votes: 229 },
    ],
    authorId: 'QuietOne',
    timestamp: now - 20 * hour,
    startAt: now - 20 * hour,
    endAt: now - hour, // ended
  },
];
