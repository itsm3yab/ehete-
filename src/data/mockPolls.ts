import { Poll } from '../types';

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const now = Date.now();

function endOfDayFromNow(daysAhead: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export const mockPolls: Poll[] = [
  {
    id: 'p1',
    question: 'Injera with shiro or kitfo — which one wins at family gatherings?',
    category: 'Family',
    options: [
      { id: 'p1a', text: 'Shiro forever', votes: 186 },
      { id: 'p1b', text: 'Kitfo without question', votes: 142 },
      { id: 'p1c', text: 'Both on one plate', votes: 97 },
    ],
    authorId: 'AddisGirl',
    timestamp: now - 3 * hour,
    startAt: now - 3 * hour,
    endAt: endOfDayFromNow(2),
  },
  {
    id: 'p2',
    question: 'Is marrying through family introduction still the better Ethiopian path?',
    category: 'Love/Cheating',
    options: [
      { id: 'p2a', text: 'Yes, family knows best', votes: 121 },
      { id: 'p2b', text: 'No, choose yourself', votes: 168 },
      { id: 'p2c', text: 'A mix of both', votes: 89 },
    ],
    authorId: 'HabeshaHeart',
    timestamp: now - 6 * hour,
    startAt: now - 6 * hour,
    endAt: endOfDayFromNow(4),
  },
  {
    id: 'p3',
    question: 'Coffee ceremony at home every weekend — tradition or pressure?',
    category: 'Friendship',
    options: [
      { id: 'p3a', text: 'Beautiful tradition', votes: 203 },
      { id: 'p3b', text: 'Feels like pressure', votes: 74 },
    ],
    authorId: 'BunaSister',
    timestamp: now - 10 * hour,
    startAt: now - 10 * hour,
    endAt: endOfDayFromNow(1),
  },
  {
    id: 'p4',
    question: 'Should more Ethiopian women talk openly about mental stress with friends?',
    category: 'Mental Health',
    options: [
      { id: 'p4a', text: 'Yes, we need that', votes: 241 },
      { id: 'p4b', text: 'Only with close people', votes: 112 },
      { id: 'p4c', text: 'Still hard for me', votes: 88 },
    ],
    authorId: 'QuietAddis',
    timestamp: now - day,
    startAt: now - day,
    endAt: endOfDayFromNow(5),
  },
  {
    id: 'p5',
    question: 'Working abroad vs building in Ethiopia — what would you choose?',
    category: 'Work',
    options: [
      { id: 'p5a', text: 'Go abroad', votes: 157 },
      { id: 'p5b', text: 'Build at home', votes: 134 },
      { id: 'p5c', text: 'Hybrid if possible', votes: 119 },
    ],
    authorId: 'TechHabesha',
    timestamp: now - 2 * day,
    startAt: now - 2 * day,
    endAt: endOfDayFromNow(6),
  },
  {
    id: 'p6',
    question: 'Timket or Meskel — which celebration hits harder for you?',
    category: 'Other',
    options: [
      { id: 'p6a', text: 'Timket', votes: 178 },
      { id: 'p6b', text: 'Meskel', votes: 165 },
    ],
    authorId: 'FestivalFan',
    timestamp: now - 3 * day,
    startAt: now - 3 * day,
    endAt: now - 2 * hour,
  },
  {
    id: 'p7',
    question: 'Is saving money harder in Addis than people admit?',
    category: 'Finance & Money',
    options: [
      { id: 'p7a', text: 'Yes, very hard', votes: 266 },
      { id: 'p7b', text: 'Depends on lifestyle', votes: 98 },
      { id: 'p7c', text: 'Still doable', votes: 51 },
    ],
    authorId: 'BirrTalk',
    timestamp: now - 4 * day,
    startAt: now - 4 * day,
    endAt: now - day,
  },
  {
    id: 'p8',
    question: 'University in Ethiopia prepared you enough for real work?',
    category: 'School & College',
    options: [
      { id: 'p8a', text: 'Mostly yes', votes: 67 },
      { id: 'p8b', text: 'Not really', votes: 214 },
      { id: 'p8c', text: 'Only the network mattered', votes: 93 },
    ],
    authorId: 'CampusVoice',
    timestamp: now - 5 * day,
    startAt: now - 5 * day,
    endAt: now - 6 * hour,
  },
];
