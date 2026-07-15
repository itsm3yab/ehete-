import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../store/AppContext';
import { useTheme, useColors, fontWeight } from '../store/theme';
import { TabBarScrollProvider, useTabBarScroll } from './TabBarScrollContext';
import { AuthGateProvider, promptAuth } from '../components/AuthGate';
import { navigationRef } from './navigationRef';
import { hapticSelect } from '../utils/haptics';

import WelcomeScreen from '../screens/WelcomeScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import PostScreen from '../screens/PostScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import VotingScreen from '../screens/VotingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailScreen from '../screens/DetailScreen';
import MyConfessionsScreen from '../screens/MyConfessionsScreen';
import SavedScreen from '../screens/SavedScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import FaqScreen from '../screens/FaqScreen';
import NotificationsSettingsScreen from '../screens/NotificationsSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import AppearanceSettingsScreen from '../screens/AppearanceSettingsScreen';
import AboutScreen from '../screens/AboutScreen';

// Telegram-style floating solid tab bar
const TG = {
  active: '#2AABEE',
  inactive: '#8E8E93',
  label: 10,
  icon: 24,
  radius: 28,
  side: 14,
  height: 62,
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PushOptionsBase = {
  headerShown: false,
  ...TransitionPresets.SlideFromRightIOS,
};

function AuthStack() {
  const colors = useColors();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}

function FeedStack() {
  const colors = useColors();
  const push = { ...PushOptionsBase, cardStyle: { backgroundColor: colors.bg } };
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="FeedHome" component={FeedScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} options={push} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={push} />
      <Stack.Screen name="MyConfessions" component={MyConfessionsScreen} options={push} />
      <Stack.Screen name="Saved" component={SavedScreen} options={push} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={push} />
      <Stack.Screen name="Faq" component={FaqScreen} options={push} />
      <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} options={push} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={push} />
      <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} options={push} />
      <Stack.Screen name="About" component={AboutScreen} options={push} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  const colors = useColors();
  const push = { ...PushOptionsBase, cardStyle: { backgroundColor: colors.bg } };
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} options={push} />
    </Stack.Navigator>
  );
}

const TAB_META: Record<string, { outline: string; filled: string; label: string }> = {
  Feed: { outline: 'chatbubbles-outline', filled: 'chatbubbles', label: 'Home' },
  Search: { outline: 'search-outline', filled: 'search', label: 'Search' },
  Post: { outline: 'create-outline', filled: 'create', label: 'New' },
  Voting: { outline: 'bar-chart-outline', filled: 'bar-chart', label: 'Voting' },
  Notifications: { outline: 'notifications-outline', filled: 'notifications', label: 'Alerts' },
};

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isDark } = useTheme();
  const { translateY, showTabBar, forceHidden } = useTabBarScroll();
  const [barWidth, setBarWidth] = useState(0);
  const lensX = useRef(new Animated.Value(0)).current;
  const lensScale = useRef(new Animated.Value(1)).current;
  const inactive = isDark ? '#8E8E93' : colors.navIcon;
  const active = colors.accent;
  const tabCount = state.routes.length;
  const tabW = barWidth > 0 ? barWidth / tabCount : 0;

  useEffect(() => {
    showTabBar();
  }, [state.index, showTabBar]);

  useEffect(() => {
    if (tabW <= 0) return;
    Animated.parallel([
      Animated.spring(lensX, {
        toValue: state.index * tabW,
        useNativeDriver: true,
        friction: 8,
        tension: 70,
      }),
      Animated.sequence([
        Animated.timing(lensScale, {
          toValue: 0.92,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(lensScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [state.index, tabW]);

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  // Fully remove tab bar on detail / compose screens so reply isn't covered
  if (forceHidden) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.dock,
        {
          paddingBottom: Math.max(insets.bottom, 8) + 14,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.45 : 0.12,
                shadowRadius: 16,
              },
              android: { elevation: isDark ? 12 : 6 },
              default: {},
            }),
          },
        ]}
      >
        <View style={styles.tabsRow} onLayout={onBarLayout}>
          {tabW > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.lens,
                {
                  width: tabW - 8,
                  backgroundColor: isDark ? colors.accentDim : colors.accentDim,
                  transform: [
                    { translateX: Animated.add(lensX, 4) },
                    { scale: lensScale },
                  ],
                },
              ]}
            />
          )}

          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const meta = TAB_META[route.name] ?? {
              outline: 'ellipse-outline',
              filled: 'ellipse',
              label: route.name,
            };
            const { options } = descriptors[route.key];
            const color = isFocused ? active : inactive;

            const onPress = () => {
              hapticSelect();
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? meta.label}
                onPress={onPress}
                onLongPress={() =>
                  navigation.emit({ type: 'tabLongPress', target: route.key })
                }
                style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              >
                <Ionicons
                  name={(isFocused ? meta.filled : meta.outline) as any}
                  size={TG.icon}
                  color={color}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.label, { color }, isFocused && styles.labelActive]}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

function MainTabs() {
  const { state: ctx } = useApp();
  const colors = useColors();

  return (
    <TabBarScrollProvider>
      <Tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          lazy: true,
          freezeOnBlur: true,
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tab.Screen name="Feed" component={FeedStack} />
        <Tab.Screen name="Search" component={SearchStack} />
        <Tab.Screen
          name="Post"
          component={PostScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              if (ctx.isLoggedIn) {
                navigation.navigate('Post');
              } else {
                promptAuth('Sign in to share a confession.');
              }
            },
          })}
        />
        <Tab.Screen name="Voting" component={VotingScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
      </Tab.Navigator>
    </TabBarScrollProvider>
  );
}

function RootNavigator() {
  const colors = useColors();
  const push = { headerShown: false, ...TransitionPresets.SlideFromRightIOS, cardStyle: { backgroundColor: colors.bg } };
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={push} />
      <Stack.Screen name="Faq" component={FaqScreen} options={push} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: isDark,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.accent,
        background: colors.bg,
        card: colors.bgCard,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.accent,
      },
    }),
    [colors, isDark]
  );
  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <AuthGateProvider>
        <RootNavigator />
      </AuthGateProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: TG.side + 4,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    minHeight: TG.height,
    borderRadius: TG.radius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TG.height,
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: TG.radius,
    overflow: 'hidden',
  },
  lens: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    borderRadius: 22,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    zIndex: 1,
    paddingVertical: 6,
  },
  tabPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  label: {
    fontSize: TG.label,
    fontWeight: fontWeight.regular,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: fontWeight.semibold,
  },
});
