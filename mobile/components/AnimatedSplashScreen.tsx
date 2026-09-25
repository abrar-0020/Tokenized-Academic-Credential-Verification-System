import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
  children: React.ReactNode;
  onAnimationComplete?: () => void;
}

// The native splash screen (configured in app.json) already handles the intro.
// This component simply hides the native splash and renders the app.
export default function AnimatedSplashScreen({ children, onAnimationComplete }: AnimatedSplashScreenProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        setReady(true);
        onAnimationComplete?.();
      });
  }, []);

  if (!ready) return null;

  return <View style={{ flex: 1 }}>{children}</View>;
}
