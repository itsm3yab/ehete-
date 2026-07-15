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
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  showTabBar: () => void;
  hideTabBar: () => void;
  /** When true, tab bar should not render (e.g. detail / reply screen). */
  forceHidden: boolean;
};

const TabBarScrollContext = createContext<TabBarScrollContextValue | null>(null);

const HIDE_DISTANCE = 200;
const SCROLL_THRESHOLD = 6;

export function TabBarScrollProvider({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);
  const visible = useRef(true);
  const animating = useRef(false);
  const forceHiddenRef = useRef(false);
  const [forceHidden, setForceHidden] = useState(false);

  const animateTo = useCallback(
    (toValue: number, nextVisible: boolean) => {
      if (animating.current && visible.current === nextVisible) return;
      visible.current = nextVisible;
      animating.current = true;
      Animated.timing(translateY, {
        toValue,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        animating.current = false;
      });
    },
    [translateY]
  );

  const showTabBar = useCallback(() => {
    forceHiddenRef.current = false;
    setForceHidden(false);
    lastY.current = 0;
    animateTo(0, true);
  }, [animateTo]);

  const hideTabBar = useCallback(() => {
    forceHiddenRef.current = true;
    setForceHidden(true);
    animateTo(HIDE_DISTANCE, false);
  }, [animateTo]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (forceHiddenRef.current) return;

      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastY.current;
      lastY.current = y;

      if (y <= 12) {
        if (!visible.current) animateTo(0, true);
        return;
      }

      if (dy > SCROLL_THRESHOLD && visible.current) {
        animateTo(HIDE_DISTANCE, false);
      } else if (dy < -SCROLL_THRESHOLD && !visible.current) {
        animateTo(0, true);
      }
    },
    [animateTo]
  );

  const value = useMemo(
    () => ({ translateY, onScroll, showTabBar, hideTabBar, forceHidden }),
    [translateY, onScroll, showTabBar, hideTabBar, forceHidden]
  );

  return (
    <TabBarScrollContext.Provider value={value}>{children}</TabBarScrollContext.Provider>
  );
}

const noopScroll = () => {};
const noopShow = () => {};
const noopHide = () => {};
const fallbackTranslateY = new Animated.Value(0);

export function useTabBarScroll() {
  const ctx = useContext(TabBarScrollContext);
  if (!ctx) {
    return {
      translateY: fallbackTranslateY,
      onScroll: noopScroll,
      showTabBar: noopShow,
      hideTabBar: noopHide,
      forceHidden: false,
    };
  }
  return ctx;
}
