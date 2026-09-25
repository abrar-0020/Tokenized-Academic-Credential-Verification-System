import '../globals';
import { appKitInstance } from '@/config/appkit';

import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect, Component } from 'react';
import { Alert, Text, View, ScrollView, LogBox } from 'react-native';
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
  "setDefaultChain"
]);

// Suppress unhandled promise rejections for this specific bug
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (error && error.message && error.message.includes('setDefaultChain')) {
      console.log('Suppressed setDefaultChain error');
      return;
    }
    originalHandler(error, isFatal);
  });
}

SplashScreen.preventAutoHideAsync();

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    SplashScreen.hideAsync();
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: 'red', paddingTop: 60, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Startup Crash!</Text>
          <ScrollView>
            <Text style={{ color: 'white', marginTop: 20, fontSize: 14 }}>
              {String(this.state.error?.message || this.state.error)}
            </Text>
            <Text style={{ color: 'white', marginTop: 10, fontSize: 12 }}>
              {String(this.state.error?.stack)}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayoutInner() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
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
  }, []);

  if (!loaded) return null;

  return (
    <AnimatedSplashScreen>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppKitProvider instance={appKitInstance}>
            <WalletProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.background },
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
