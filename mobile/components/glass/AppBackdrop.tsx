import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export const AppBackdrop: React.FC = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduceMotion(enabled)
    );

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      tx.value = 0;
      ty.value = 0;
      scale.value = 1;
      return;
    }

    tx.value = withRepeat(
      withTiming(-22, {
        duration: 22000,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
      }),
      -1,
      true
    );

    ty.value = withRepeat(
      withTiming(34, {
        duration: 22000,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
      }),
      -1,
      true
    );

    scale.value = withRepeat(
      withTiming(1.06, {
        duration: 22000,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
      }),
      -1,
      true
    );
  }, [reduceMotion]);

  const animatedOrbsStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Base Deep Pitch Black Background */}
      <View style={styles.baseBg} />

      {/* Layer 1: Three Soft Radial Ambient Glows */}
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          {/* Top-Right Electric Blue Glow */}
          <RadialGradient id="glowTopRight" cx="90%" cy="4%" r="65%">
            <Stop offset="0%" stopColor="#286EFF" stopOpacity="0.34" />
            <Stop offset="70%" stopColor="#286EFF" stopOpacity="0" />
          </RadialGradient>

          {/* Left Violet Ambient Glow */}
          <RadialGradient id="glowLeft" cx="-10%" cy="52%" r="60%">
            <Stop offset="0%" stopColor="#6450E6" stopOpacity="0.24" />
            <Stop offset="70%" stopColor="#6450E6" stopOpacity="0" />
          </RadialGradient>

          {/* Bottom-Right Deep Teal Glow */}
          <RadialGradient id="glowBottomRight" cx="100%" cy="92%" r="65%">
            <Stop offset="0%" stopColor="#1496C8" stopOpacity="0.22" />
            <Stop offset="70%" stopColor="#1496C8" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#glowTopRight)" />
        <Rect width="100%" height="100%" fill="url(#glowLeft)" />
        <Rect width="100%" height="100%" fill="url(#glowBottomRight)" />
      </Svg>

      {/* Layer 2: Three Drifting Lit Glass Orbs */}
      <Animated.View style={[styles.orbsContainer, animatedOrbsStyle]}>
        <Svg
          width={SCREEN_WIDTH + 80}
          height={SCREEN_HEIGHT + 80}
          viewBox={`0 0 ${SCREEN_WIDTH + 80} ${SCREEN_HEIGHT + 80}`}
        >
          <Defs>
            {/* Orb 1: Upper-Right Blue Orb */}
            <RadialGradient id="orb1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#5AA0FF" stopOpacity="0.95" />
              <Stop offset="70%" stopColor="#2D73FF" stopOpacity="0.55" />
              <Stop offset="100%" stopColor="#2D73FF" stopOpacity="0" />
            </RadialGradient>

            {/* Orb 2: Mid-Left Soft Violet Orb */}
            <RadialGradient id="orb2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#9682FF" stopOpacity="0.90" />
              <Stop offset="70%" stopColor="#6E5AF0" stopOpacity="0.50" />
              <Stop offset="100%" stopColor="#6E5AF0" stopOpacity="0" />
            </RadialGradient>

            {/* Orb 3: Lower-Right Cyan Aqua Orb */}
            <RadialGradient id="orb3" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#46C8E6" stopOpacity="0.85" />
              <Stop offset="70%" stopColor="#1EA0C8" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#1EA0C8" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Orb 1: Upper right */}
          <Circle
            cx={(SCREEN_WIDTH + 80) * 0.8}
            cy={(SCREEN_HEIGHT + 80) * 0.16}
            r={72}
            fill="url(#orb1)"
          />

          {/* Orb 2: Mid left */}
          <Circle
            cx={(SCREEN_WIDTH + 80) * 0.1}
            cy={(SCREEN_HEIGHT + 80) * 0.42}
            r={56}
            fill="url(#orb2)"
          />

          {/* Orb 3: Lower right */}
          <Circle
            cx={(SCREEN_WIDTH + 80) * 0.88}
            cy={(SCREEN_HEIGHT + 80) * 0.66}
            r={88}
            fill="url(#orb3)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 0,
    elevation: 0,
  },
  baseBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#090B10',
  },
  orbsContainer: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    opacity: 0.6,
  },
});
