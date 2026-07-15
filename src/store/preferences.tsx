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

const STORAGE_KEY = 'etete_prefs_v2';

export type ThemeMode = 'dark' | 'light';

export type AppPreferences = {
  notifyReplies: boolean;
  notifyVotes: boolean;
  notifyMentions: boolean;
  notifyAnnouncements: boolean;
  privateProfile: boolean;
  hideOnlineStatus: boolean;
  allowAnonymousReplies: boolean;
  themeMode: ThemeMode;
};

export const DEFAULT_PREFS: AppPreferences = {
  notifyReplies: true,
  notifyVotes: true,
  notifyMentions: true,
  notifyAnnouncements: false,
  privateProfile: false,
  hideOnlineStatus: false,
  allowAnonymousReplies: true,
  themeMode: 'light',
};

type PrefValue = boolean | ThemeMode;

type PrefsContextValue = {
  prefs: AppPreferences;
  setPref: (key: keyof AppPreferences, value: PrefValue) => void;
  resetPrefs: () => void;
  ready: boolean;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPrefs({
            ...DEFAULT_PREFS,
            ...parsed,
            themeMode: parsed.themeMode === 'dark' ? 'dark' : 'light',
          });
        }
      } catch {
        // keep defaults
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: AppPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore write errors
    }
  }, []);

  const setPref = useCallback(
    (key: keyof AppPreferences, value: PrefValue) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value } as AppPreferences;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    persist(DEFAULT_PREFS);
  }, [persist]);

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
