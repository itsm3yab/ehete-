import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ehete_cycle_v1';

export type CycleData = {
  lastPeriodStart: number | null;
  cycleLength: number;
  periodLength: number;
};

export type CyclePhase = 'period' | 'follicular' | 'fertile' | 'luteal' | 'unknown';

export type CycleSnapshot = {
  dayInCycle: number | null;
  daysUntilNext: number | null;
  nextPeriodDate: number | null;
  phase: CyclePhase;
  phaseLabel: string;
};

const DEFAULT: CycleData = {
  lastPeriodStart: null,
  cycleLength: 28,
  periodLength: 5,
};

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysBetween(a: number, b: number) {
  return Math.floor((startOfDay(b) - startOfDay(a)) / 86_400_000);
}

export function getCycleSnapshot(data: CycleData, now = Date.now()): CycleSnapshot {
  if (!data.lastPeriodStart) {
    return {
      dayInCycle: null,
      daysUntilNext: null,
      nextPeriodDate: null,
      phase: 'unknown',
      phaseLabel: 'Not set',
    };
  }

  const elapsed = daysBetween(data.lastPeriodStart, now);
  const cycle = Math.max(21, Math.min(45, data.cycleLength));
  const period = Math.max(2, Math.min(10, data.periodLength));
  const daysIntoCurrent = ((elapsed % cycle) + cycle) % cycle;
  const dayInCycle = daysIntoCurrent + 1;
  const daysUntilNext = daysIntoCurrent === 0 ? cycle : cycle - daysIntoCurrent;
  const nextPeriodDate = startOfDay(now) + daysUntilNext * 86_400_000;

  // Ovulation ~14 days before next period
  const ovulationDay = Math.max(period + 1, cycle - 14);
  const fertileStart = Math.max(period + 1, ovulationDay - 2);
  const fertileEnd = Math.min(cycle, ovulationDay + 1);

  let phase: CyclePhase;
  let phaseLabel: string;
  if (dayInCycle <= period) {
    phase = 'period';
    phaseLabel = 'Period';
  } else if (dayInCycle >= fertileStart && dayInCycle <= fertileEnd) {
    phase = 'fertile';
    phaseLabel = 'Fertile';
  } else if (dayInCycle < fertileStart) {
    phase = 'follicular';
    phaseLabel = 'After period';
  } else {
    phase = 'luteal';
    phaseLabel = 'Before period';
  }

  return {
    dayInCycle,
    daysUntilNext,
    nextPeriodDate,
    phase,
    phaseLabel,
  };
}

type CycleContextValue = {
  data: CycleData;
  snapshot: CycleSnapshot;
  ready: boolean;
  setLastPeriodStart: (ts: number) => void;
  markPeriodStartedToday: () => void;
  setCycleLength: (n: number) => void;
  setPeriodLength: (n: number) => void;
  clearCycle: () => void;
};

const CycleContext = createContext<CycleContextValue | null>(null);

export function CycleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CycleData>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<CycleData>;
          setData({
            lastPeriodStart:
              typeof parsed.lastPeriodStart === 'number' ? parsed.lastPeriodStart : null,
            cycleLength:
              typeof parsed.cycleLength === 'number' ? parsed.cycleLength : DEFAULT.cycleLength,
            periodLength:
              typeof parsed.periodLength === 'number' ? parsed.periodLength : DEFAULT.periodLength,
          });
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: CycleData) => {
    setData(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setLastPeriodStart = useCallback(
    (ts: number) => persist({ ...data, lastPeriodStart: startOfDay(ts) }),
    [data, persist]
  );

  const markPeriodStartedToday = useCallback(() => {
    persist({ ...data, lastPeriodStart: startOfDay(Date.now()) });
  }, [data, persist]);

  const setCycleLength = useCallback(
    (n: number) => persist({ ...data, cycleLength: Math.max(21, Math.min(45, n)) }),
    [data, persist]
  );

  const setPeriodLength = useCallback(
    (n: number) => persist({ ...data, periodLength: Math.max(2, Math.min(10, n)) }),
    [data, persist]
  );

  const clearCycle = useCallback(() => persist(DEFAULT), [persist]);

  const snapshot = useMemo(() => getCycleSnapshot(data), [data]);

  const value = useMemo(
    () => ({
      data,
      snapshot,
      ready,
      setLastPeriodStart,
      markPeriodStartedToday,
      setCycleLength,
      setPeriodLength,
      clearCycle,
    }),
    [
      data,
      snapshot,
      ready,
      setLastPeriodStart,
      markPeriodStartedToday,
      setCycleLength,
      setPeriodLength,
      clearCycle,
    ]
  );

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be inside CycleProvider');
  return ctx;
}
