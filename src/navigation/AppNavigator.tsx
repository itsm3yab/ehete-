import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../store/AppContext';
import { colors, typography } from '../store/theme';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import PostScreen from '../screens/PostScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailScreen from '../screens/DetailScreen';
import MyConfessionsScreen from '../screens/MyConfessionsScreen';
import SavedScreen from '../screens/SavedScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

// ─── Navigation Theme ─────────────────────────────────────────────────────────

const NavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.bgCard,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ModalOptions = {
  headerShown: false,
  ...TransitionPresets.ModalSlideFromBottomIOS,
  cardStyle: { backgroundColor: colors.bg },
};

const PushOptions = {
  headerShown: false,
  ...TransitionPresets.SlideFromRightIOS,
  cardStyle: { backgroundColor: colors.bg },
};

// ─── Auth Stack ───────────────────────────────────────────────────────────────

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={PushOptions} />
      <Stack.Screen name="Signup" component={SignupScreen} options={PushOptions} />
    </Stack.Navigator>
  );
}

// ─── Feed Stack ───────────────────────────────────────────────────────────────

function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="FeedHome" component={FeedScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} options={PushOptions} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={PushOptions} />
    </Stack.Navigator>
  );
}

// ─── Search Stack ─────────────────────────────────────────────────────────────

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} options={PushOptions} />
    </Stack.Navigator>
  );
}

// ─── Profile Stack ────────────────────────────────────────────────────────────

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="MyConfessions" component={MyConfessionsScreen} options={PushOptions} />
      <Stack.Screen name="Saved" component={SavedScreen} options={PushOptions} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={PushOptions} />
      <Stack.Screen name="Detail" component={DetailScreen} options={PushOptions} />
      <Stack.Screen name="Login" component={LoginScreen} options={PushOptions} />
      <Stack.Screen name="Signup" component={SignupScreen} options={PushOptions} />
    </Stack.Navigator>
  );
}

// ─── Main Tabs ────────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, [string, string]> = {
  Feed:          ['home',          'home-outline'],
  Search:        ['search',        'search-outline'],
  Post:          ['add-circle',    'add-circle-outline'],
  Notifications: ['notifications', 'notifications-outline'],
  Profile:       ['person',        'person-outline'],
};

function MainTabs() {
  const { state } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.navIconActive,
        tabBarInactiveTintColor: colors.navIcon,
        tabBarIcon: ({ focused, color }) => {
          const [filled, outline] = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
          const isPost = route.name === 'Post';
          if (isPost) {
            return (
              <View style={[styles.postTabBtn, focused && styles.postTabBtnActive]}>
                <Ionicons name="add" size={24} color={focused ? '#fff' : colors.navIconActive} />
              </View>
            );
          }
          return (
            <Ionicons
              name={(focused ? filled : outline) as any}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            if (state.isLoggedIn) {
              navigation.navigate('Post');
            } else {
              navigation.navigate('Profile', { screen: 'Login' });
            }
          },
        })}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={PushOptions} />
    </Stack.Navigator>
  );
}

// ─── App Navigator ────────────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer theme={NavTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgCard,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    height: 56,
    paddingBottom: 6,
    paddingTop: 6,
  },
  postTabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTabBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
