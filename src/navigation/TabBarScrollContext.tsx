import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type TabBarScrollContextValue = {
  translateY: Animated.Value;
  /** Moves upward (negative) when chrome hides — use for top bars. */
  headerTranslateY: Animated.Value;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  showTabBar: () => void;
  hideTabBar: () => void;
  /** When true, tab bar should not render (e.g. detail / reply screen). */
  forceHidden: boolean;
  /** Top chrome currently shown (for pointerEvents). */
  chromeVisible: boolean;
};

const TabBarScrollContext = createContext<TabBarScrollContextValue | null>(null);

const HIDE_DISTANCE = 200;
const HEADER_HIDE_DISTANCE = 120;
const SCROLL_THRESHOLD = 6;

export function TabBarScrollProvider({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);
  const visible = useRef(true);
  const animating = useRef(false);
  const forceHiddenRef = useRef(false);
  const [forceHidden, setForceHidden] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

  const animateTo = useCallback(
    (tabTo: number, headerTo: number, nextVisible: boolean) => {
      if (animating.current && visible.current === nextVisible) return;
      visible.current = nextVisible;
      setChromeVisible(nextVisible);
      animating.current = true;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: tabTo,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: headerTo,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animating.current = false;
      });
    },
    [translateY, headerTranslateY]
  );

  const showTabBar = useCallback(() => {
    forceHiddenRef.current = false;
    setForceHidden(false);
    lastY.current = 0;
    animateTo(0, 0, true);
  }, [animateTo]);

  const hideTabBar = useCallback(() => {
    forceHiddenRef.current = true;
    setForceHidden(true);
    animateTo(HIDE_DISTANCE, -HEADER_HIDE_DISTANCE, false);
  }, [animateTo]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (forceHiddenRef.current) return;

      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastY.current;
      lastY.current = y;

      if (y <= 12) {
        if (!visible.current) animateTo(0, 0, true);
        return;
      }

      if (dy > SCROLL_THRESHOLD && visible.current) {
        animateTo(HIDE_DISTANCE, -HEADER_HIDE_DISTANCE, false);
      } else if (dy < -SCROLL_THRESHOLD && !visible.current) {
        animateTo(0, 0, true);
      }
    },
    [animateTo]
  );

  const value = useMemo(
    () => ({
      translateY,
      headerTranslateY,
      onScroll,
      showTabBar,
      hideTabBar,
      forceHidden,
      chromeVisible,
    }),
    [
      translateY,
      headerTranslateY,
      onScroll,
      showTabBar,
      hideTabBar,
      forceHidden,
      chromeVisible,
    ]
  );

  return (
    <TabBarScrollContext.Provider value={value}>{children}</TabBarScrollContext.Provider>
  );
}

const noopScroll = () => {};
const noopShow = () => {};
const noopHide = () => {};
const fallbackTranslateY = new Animated.Value(0);
const fallbackHeaderTranslateY = new Animated.Value(0);

export function useTabBarScroll() {
  const ctx = useContext(TabBarScrollContext);
  if (!ctx) {
    return {
      translateY: fallbackTranslateY,
      headerTranslateY: fallbackHeaderTranslateY,
      onScroll: noopScroll,
      showTabBar: noopShow,
      hideTabBar: noopHide,
      forceHidden: false,
      chromeVisible: true,
    };
  }
  return ctx;
}
