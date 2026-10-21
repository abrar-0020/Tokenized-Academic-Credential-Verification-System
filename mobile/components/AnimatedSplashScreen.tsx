import React, { useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
  children: React.ReactNode;
  onAnimationComplete?: () => void;
}

export default function AnimatedSplashScreen({ children, onAnimationComplete }: AnimatedSplashScreenProps) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    onAnimationComplete?.();
  }, []);

  return <View style={{ flex: 1 }}>{children}</View>;
}
