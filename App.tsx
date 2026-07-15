import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, View } from 'react-native';
import { StatusBar, setStatusBarStyle, setStatusBarHidden } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/store/AppContext';
import { PrefsProvider } from './src/store/preferences';
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

function AppShell() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ThemedStatusBar />
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
            <ThemeProvider>
              <AppShell />
            </ThemeProvider>
          </PrefsProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
