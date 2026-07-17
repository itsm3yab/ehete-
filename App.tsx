import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, View } from 'react-native';
import { StatusBar, setStatusBarStyle, setStatusBarHidden } from 'expo-status-bar';
import * as ScreenCapture from 'expo-screen-capture';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/store/AppContext';
import { PrefsProvider, usePrefs } from './src/store/preferences';
import { CycleProvider } from './src/store/cycle';
import { ThemeProvider, useTheme } from './src/store/theme';
import AppNavigator from './src/navigation/AppNavigator';

/** One place owns the system status bar — screens must not fight this. */
function ThemedStatusBar() {
  const { isDark, colors } = useTheme();
  const style = isDark ? 'light' : 'dark';
  const bg = colors.bg;

  useEffect(() => {
    setStatusBarHidden(false, 'none');
    setStatusBarStyle(style, true);

    if (Platform.OS !== 'android') return;

    try {
      RNStatusBar.setHidden(false);
      // Solid bar matching the screen — avoids a black strip under translucent edge-to-edge
      RNStatusBar.setTranslucent(false);
      RNStatusBar.setBackgroundColor(bg, true);
      RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    } catch {
      // Some edge-to-edge Android builds ignore backgroundColor / translucent
    }
  }, [isDark, style, bg]);

  return <StatusBar style={style} hidden={false} animated />;
}

function ScreenPrivacyGuard() {
  const { prefs, ready } = usePrefs();

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        if (prefs.preventScreenshots) {
          await ScreenCapture.preventScreenCaptureAsync('ehete');
          if (Platform.OS === 'ios') {
            await ScreenCapture.enableAppSwitcherProtectionAsync(0.7);
          }
        } else {
          await ScreenCapture.allowScreenCaptureAsync('ehete');
          if (Platform.OS === 'ios') {
            await ScreenCapture.disableAppSwitcherProtectionAsync();
          }
        }
      } catch {
        // Native module unavailable (e.g. web)
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [prefs.preventScreenshots, ready]);

  return null;
}

function AppShell() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ThemedStatusBar />
      <ScreenPrivacyGuard />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <SafeAreaProvider>
        <AppProvider>
          <PrefsProvider>
            <CycleProvider>
              <ThemeProvider>
                <AppShell />
              </ThemeProvider>
            </CycleProvider>
          </PrefsProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
