import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar, setStatusBarStyle, setStatusBarHidden } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/store/AppContext';
import { PrefsProvider } from './src/store/preferences';
import { ThemeProvider, useTheme } from './src/store/theme';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  const style = isDark ? 'light' : 'dark';

  useEffect(() => {
    setStatusBarHidden(false, 'none');
    setStatusBarStyle(style);
    if (Platform.OS === 'android') {
      try {
        RNStatusBar.setHidden(false);
        RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
      } catch {
        // ignore API gaps on edge-to-edge devices
      }
    }
  }, [isDark, style]);

  return <StatusBar style={style} hidden={false} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <PrefsProvider>
            <ThemeProvider>
              <ThemedStatusBar />
              <AppNavigator />
            </ThemeProvider>
          </PrefsProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
