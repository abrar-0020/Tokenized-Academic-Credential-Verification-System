import '../globals';
import { appKitInstance } from '@/config/appkit';

import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect, Component } from 'react';
import { Alert, Text, View, ScrollView, LogBox, StatusBar as RNStatusBar, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppKit, AppKitProvider } from '@reown/appkit-react-native';
import { WalletProvider } from '@/context/WalletContext';
import { Colors } from '@/config/theme';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';


LogBox.ignoreLogs([
  "Cannot read property 'setDefaultChain' of undefined",
  "setDefaultChain",
  "TypeError: Cannot read property 'setDefaultChain'",
  "Uncaught (in promise",
]);

// Suppress unhandled promise rejections for WalletConnect internal chain sync bug
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    const msg = error?.message || String(error);
    if (msg.includes('setDefaultChain')) {
      return;
    }
    originalHandler(error, isFatal);
  });
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any) {
    SplashScreen.hideAsync().catch(() => {});
  }
  render() {
    if (this.state.hasError) {
      if (__DEV__) {
        return (
          <View style={{ flex: 1, backgroundColor: '#180707', paddingTop: 60, padding: 20 }}>
            <Text style={{ color: '#ff6b6b', fontSize: 24, fontWeight: 'bold' }}>Startup Crash (Debug)</Text>
            <ScrollView>
              <Text style={{ color: 'white', marginTop: 20, fontSize: 14 }}>
                {String(this.state.error?.message || this.state.error)}
              </Text>
              <Text style={{ color: '#999', marginTop: 10, fontSize: 12 }}>
                {String(this.state.error?.stack)}
              </Text>
            </ScrollView>
          </View>
        );
      }
      return (
        <View style={{ flex: 1, backgroundColor: '#090B10', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
            TokCred encountered an unexpected error. Please restart the app.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            onPress={async () => {
              try {
                await Updates.reloadAsync();
              } catch {}
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 15 }}>Restart App</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayoutInner() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Instantly hide splash screen as soon as native container is mounted
    SplashScreen.hideAsync().catch(() => {});

    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert('Update Available', 'Reload?', [
            { text: 'Later', style: 'cancel' },
            { text: 'Reload', onPress: async () => await Updates.reloadAsync() },
          ]);
        }
      } catch (error) {}
    }
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
    // Edge-to-edge status bar on Android
    RNStatusBar.setBarStyle('light-content');
    if (RNStatusBar.setTranslucent) {
      RNStatusBar.setTranslucent(true);
    }
    if (RNStatusBar.setBackgroundColor) {
      RNStatusBar.setBackgroundColor('transparent');
    }
  }, []);

  return (
    <AnimatedSplashScreen>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppKitProvider instance={appKitInstance}>
            <WalletProvider>
              <StatusBar style="light" />
              <Stack
                initialRouteName="index"
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#090B10' },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="wallet-connect" />
                <Stack.Screen name="verify" />
                <Stack.Screen name="verifying" options={{ animation: 'fade' }} />
                <Stack.Screen name="verified" />
                <Stack.Screen name="failed" />
                <Stack.Screen name="credential/[id]" />
                <Stack.Screen name="qr/[id]" />
                <Stack.Screen name="issue" />
                <Stack.Screen name="review" />
                <Stack.Screen name="transaction" options={{ animation: 'fade', gestureEnabled: false }} />
                <Stack.Screen name="success" />
                <Stack.Screen name="(tabs)" options={{ animation: 'none', gestureEnabled: false }} />
                <Stack.Screen name="glass-test" options={{ animation: 'slide_from_right' }} />
              </Stack>
              <AppKit />
            </WalletProvider>
          </AppKitProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AnimatedSplashScreen>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutInner />
    </ErrorBoundary>
  );
}
