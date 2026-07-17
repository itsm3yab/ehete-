import { GuyCheck, GuyCheckTip } from '../types';

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const now = Date.now();

export const mockGuyChecks: GuyCheck[] = [
  {
    id: 'g1',
    nameOrNick: 'Dawit (works near Bole)',
    area: 'Addis Ababa · Bole',
    concern: 'Married?',
    details:
      "We've been talking for 2 months. He never invites me to his place and always disappears on weekends. Sisters — does anyone know if he's married?",
    timestamp: now - 3 * hour,
    authorId: '',
    tipCount: 3,
  },
  {
    id: 'g2',
    nameOrNick: 'Mike / Mikael · tall, drives a white Land Cruiser',
    area: 'Addis · CMC / Ayat',
    concern: 'Dangerous',
    details:
      'Met on Instagram. Gets angry fast when I say no. A friend said he hurt someone before. Please warn me if you know him.',
    timestamp: now - 10 * hour,
    authorId: '',
    tipCount: 2,
  },
  {
    id: 'g3',
    nameOrNick: 'Yonas · says he works in Dubai',
    area: 'Online / WhatsApp',
    concern: 'Scammer',
    details:
      'Asked me to help move money and keep promising gifts. Feels like a romance scam. Has anyone dealt with him?',
    timestamp: now - day,
    authorId: '',
    tipCount: 4,
  },
  {
    id: 'g4',
    nameOrNick: 'Abel from campus (Engineering)',
    area: 'Addis · AAU area',
    concern: 'Serial cheater',
    details:
      'Dating him casually. Heard he has 3 girls at once. Sisters from campus — is this true?',
    timestamp: now - 2 * day,
    authorId: '',
    tipCount: 2,
  },
];

export const mockGuyTips: GuyCheckTip[] = [
  {
    id: 'gt1',
    checkId: 'g1',
    tag: 'Married / has family',
    text: 'Yes — he has a wife in Gerji. Be careful sister.',
    timestamp: now - 2 * hour,
    authorId: '',
    helpfulCount: 18,
  },
  {
    id: 'gt2',
    checkId: 'g1',
    tag: 'Avoid him',
    text: 'Same guy lied to my cousin last year. Leave him.',
    timestamp: now - hour,
    authorId: '',
    helpfulCount: 11,
  },
  {
    id: 'gt3',
    checkId: 'g1',
    tag: 'Other tip',
    text: 'Ask to meet his family once. Married men always dodge that.',
    timestamp: now - 40 * 60 * 1000,
    authorId: '',
    helpfulCount: 7,
  },
  {
    id: 'gt4',
    checkId: 'g2',
    tag: 'Violent / unsafe',
    text: 'Stay away. He has a bad temper and has threatened girls before.',
    timestamp: now - 6 * hour,
    authorId: '',
    helpfulCount: 24,
  },
  {
    id: 'gt5',
    checkId: 'g2',
    tag: 'Avoid him',
    text: 'Block and tell a trusted friend where you are if you already met.',
    timestamp: now - 5 * hour,
    authorId: '',
    helpfulCount: 15,
  },
  {
    id: 'gt6',
    checkId: 'g3',
    tag: 'Scammer',
    text: 'Classic Dubai romance scam pattern. Never send money.',
    timestamp: now - 20 * hour,
    authorId: '',
    helpfulCount: 31,
  },
  {
    id: 'gt7',
    checkId: 'g3',
    tag: 'Scammer',
    text: 'Same story happened to me. Fake voice notes too.',
    timestamp: now - 18 * hour,
    authorId: '',
    helpfulCount: 12,
  },
  {
    id: 'gt8',
    checkId: 'g3',
    tag: 'Avoid him',
    text: 'Cut contact completely. Report the number if you can.',
    timestamp: now - 12 * hour,
    authorId: '',
    helpfulCount: 9,
  },
  {
    id: 'gt9',
    checkId: 'g3',
    tag: 'Other tip',
    text: 'Reverse image search his profile pics — often stolen.',
    timestamp: now - 8 * hour,
    authorId: '',
    helpfulCount: 14,
  },
  {
    id: 'gt10',
    checkId: 'g4',
    tag: 'Known player',
    text: 'Yes, known around campus. Not serious with anyone.',
    timestamp: now - day,
    authorId: '',
    helpfulCount: 20,
  },
  {
    id: 'gt11',
    checkId: 'g4',
    tag: 'Seems okay',
    text: "I know him as friendly only — but I'm not dating him so trust your gut.",
    timestamp: now - 20 * hour,
    authorId: '',
    helpfulCount: 3,
  },
];
