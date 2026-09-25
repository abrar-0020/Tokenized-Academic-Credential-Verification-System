import '../globals';
import '@/config/appkit'; // Initialize AppKit before anything else

import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppKit } from '@reown/appkit-react-native';
import { WalletProvider } from '@/context/WalletContext';
import { Colors } from '@/config/theme';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

// Keep the native splash screen visible while fonts and app initialize
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // OTA Updates Check
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available',
            'A new version of the app was just downloaded. Do you want to reload the app to apply it now?',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Reload', onPress: async () => await Updates.reloadAsync() },
            ]
          );
        }
      } catch (error) {
        // Silently ignore update errors in development or if offline
        console.log(`Error fetching latest Expo update: ${error}`);
      }
    }
    
    // Only check for updates if we aren't in development mode
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  if (!loaded) return null;

  return (
    <AnimatedSplashScreen>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
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
              <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
            </Stack>
            {/* AppKit renders the WalletConnect modal */}
            <AppKit />
          </WalletProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AnimatedSplashScreen>
  );
}
