import React, { useEffect, useState, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '@/config/theme';

interface AnimatedSplashScreenProps {
  children: React.ReactNode;
  onAnimationComplete?: () => void;
}

export default function AnimatedSplashScreen({ children, onAnimationComplete }: AnimatedSplashScreenProps) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepareAndAnimate() {
      // Hide the native splash screen as we take over with our React one
      await SplashScreen.hideAsync();

      // Start the animation after a short delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsAnimationComplete(true);
          onAnimationComplete?.();
        });
      }, 1500); // How long the static image is shown before fading out
    }

    prepareAndAnimate();
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  return (
    <View style={styles.container}>
      {children}
      {!isAnimationComplete && (
        <Animated.View
          style={[
            styles.splashContainer,
            {
              opacity: fadeAnim,
            },
          ]}
          pointerEvents="none"
        >
          <Animated.Image
            source={require('@/assets/icon.jpg')}
            style={[
              styles.image,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', // Black background to match the icon
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
  },
});
