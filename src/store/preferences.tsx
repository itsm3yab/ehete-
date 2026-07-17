import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  ReactNode,
} from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ehete_prefs_v2';

export type ThemeMode = 'dark' | 'light';
export type AppLanguage = 'en' | 'am' | 'om';

export type AppPreferences = {
  notifyReplies: boolean;
  notifyVotes: boolean;
  notifyMentions: boolean;
  notifyAnnouncements: boolean;
  privateProfile: boolean;
  hideOnlineStatus: boolean;
  allowAnonymousReplies: boolean;
  preventScreenshots: boolean;
  themeMode: ThemeMode;
  language: AppLanguage;
};

export const DEFAULT_PREFS: AppPreferences = {
  notifyReplies: true,
  notifyVotes: true,
  notifyMentions: true,
  notifyAnnouncements: false,
  privateProfile: false,
  hideOnlineStatus: false,
  allowAnonymousReplies: true,
  preventScreenshots: true,
  themeMode: 'light',
  language: 'en',
};

type PrefValue = boolean | ThemeMode | AppLanguage;

type PrefsContextValue = {
  prefs: AppPreferences;
  setPref: (key: keyof AppPreferences, value: PrefValue) => void;
  resetPrefs: () => void;
  ready: boolean;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

function normalizePrefs(raw: Partial<AppPreferences> | null | undefined): AppPreferences {
  const parsed = raw ?? {};
  return {
    ...DEFAULT_PREFS,
    ...parsed,
    preventScreenshots:
      typeof parsed.preventScreenshots === 'boolean'
        ? parsed.preventScreenshots
        : DEFAULT_PREFS.preventScreenshots,
    themeMode: parsed.themeMode === 'dark' ? 'dark' : 'light',
    language:
      parsed.language === 'am' ? 'am' : parsed.language === 'om' ? 'om' : 'en',
  };
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const prefsRef = useRef(prefs);
  const dirtyRef = useRef(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          setPrefs(normalizePrefs(JSON.parse(raw)));
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

  const flushPersist = useCallback((next: AppPreferences) => {
    InteractionManager.runAfterInteractions(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    });
  }, []);

  const schedulePersist = useCallback(
    (next: AppPreferences) => {
      dirtyRef.current = true;
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        if (!dirtyRef.current) return;
        dirtyRef.current = false;
        flushPersist(next);
      }, 180);
    },
    [flushPersist]
  );

  useEffect(() => {
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      if (dirtyRef.current) {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefsRef.current)).catch(
          () => {}
        );
      }
    };
  }, []);

  const setPref = useCallback(
    (key: keyof AppPreferences, value: PrefValue) => {
      const apply = () => {
        setPrefs((prev) => {
          if (prev[key] === value) return prev;
          const next = { ...prev, [key]: value } as AppPreferences;
          schedulePersist(next);
          return next;
        });
      };

      // Theme swaps can re-style the tree — keep taps snappy
      if (key === 'themeMode') {
        startTransition(apply);
      } else {
        apply();
      }
    },
    [schedulePersist]
  );

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    schedulePersist(DEFAULT_PREFS);
  }, [schedulePersist]);

  const value = useMemo(
    () => ({ prefs, setPref, resetPrefs, ready }),
    [prefs, setPref, resetPrefs, ready]
  );

  return (
    <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be inside PrefsProvider');
  return ctx;
}
