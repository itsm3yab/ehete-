import { DistressSignal } from '../types';

const hour = 60 * 60 * 1000;
const now = Date.now();

/** Demo nearby distress (not yours) so Alerts tab shows how receiving looks */
export const mockDistressSignals: DistressSignal[] = [
  {
    id: 'd-demo-1',
    status: 'active',
    placeLabel: 'Near Mexico Square · ~0.8 km',
    latitude: 9.0105,
    longitude: 38.7612,
    timestamp: now - 4 * 60 * 1000,
    authorId: '',
    isMine: false,
    notifiedCount: 7,
    responders: [
      {
        id: 'r1',
        label: 'Sister nearby',
        message: 'I see this — heading that way.',
        timestamp: now - 2 * 60 * 1000,
      },
    ],
  },
];
