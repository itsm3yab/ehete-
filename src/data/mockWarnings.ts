import { SafetyWarning } from '../types';

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const now = Date.now();

export const mockWarnings: SafetyWarning[] = [
  {
    id: 'w1',
    place: 'Bole Road near Edna Mall',
    warningType: 'Harassment',
    detail:
      'Groups of men hanging around late afternoon keep following and catcalling. Walk with a sister if you can.',
    tip: 'Use the other side of the street or take a ride after 6pm.',
    helpfulCount: 48,
    timestamp: now - 2 * hour,
    authorId: '',
  },
  {
    id: 'w2',
    place: 'Piassa side alleys',
    warningType: 'Unsafe at night',
    detail:
      'After dark the side streets get very empty and poorly lit. A friend was cornered there last week.',
    tip: 'Stick to main roads or share a taxi with someone you trust.',
    helpfulCount: 72,
    timestamp: now - 8 * hour,
    authorId: '',
  },
  {
    id: 'w3',
    place: 'Merkato taxi queue',
    warningType: 'Theft / scam',
    detail:
      'Someone tried to snatch a bag while loading into a shared taxi. Drivers sometimes overcharge alone girls.',
    tip: 'Keep your bag in front of you and agree on the fare first.',
    helpfulCount: 35,
    timestamp: now - day,
    authorId: '',
  },
  {
    id: 'w4',
    place: 'CMC construction stretch',
    warningType: 'Assault risk',
    detail:
      'Isolated stretch with few people around. Avoid walking alone especially evenings.',
    tip: 'Call someone while you walk or take a bajaj.',
    helpfulCount: 61,
    timestamp: now - 2 * day,
    authorId: '',
  },
  {
    id: 'w5',
    place: 'Kazanchis after offices close',
    warningType: 'Bad transport',
    detail:
      'Hard to find safe rides after 8pm. Some drivers refuse or act rude when you ask for a short trip.',
    tip: 'Book a ride before you leave the building.',
    helpfulCount: 29,
    timestamp: now - 3 * day,
    authorId: '',
  },
];
