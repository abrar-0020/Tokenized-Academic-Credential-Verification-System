import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export interface FixedGlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  intensity?: number;
  heroGradient?: boolean;
}

export const FixedGlassSurface: React.FC<FixedGlassSurfaceProps> = ({
  children,
  style,
  borderRadius = 22,
  intensity = 28,
  heroGradient = false,
}) => {
  const gradientColors = heroGradient
    ? (['rgba(255,255,255,0.17)', 'rgba(59,140,255,0.24)'] as const)
    : (['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'] as const);

  return (
    // Layer 1: Outer View with drop shadow only (no overflow: 'hidden')
    <View style={[styles.outerShadow, { borderRadius }, style]}>
      {/* Layer 2: Inner clip View (overflow: 'hidden') */}
      <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>
        {/* 2a: Blurred backdrop (light/default tint, pointerEvents: 'none') */}
        <BlurView
          intensity={intensity}
          tint="default"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* 2b: Fill 145° diagonal specular translucent fill */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* 2c: Inner glow (faint white 4% inset gradient) */}
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.35 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* 2d: Top rim line (1.5pt LinearGradient, white 30% center, fading at ends) */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0)',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.topRim}
          pointerEvents="none"
        />

        {/* 2e: Bottom edge (1pt white 4% line) */}
        <View style={styles.bottomEdge} pointerEvents="none" />
      </View>

      {/* Layer 3: Border overlay with exact radius */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.borderOverlay,
          { borderRadius },
        ]}
        pointerEvents="none"
      />

      {/* Layer 4: Children with padding above all glass layers */}
      <View style={[styles.content, { borderRadius }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 36,
    elevation: 0,
    position: 'relative',
  },
  borderOverlay: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  topRim: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1.5,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  content: {
    padding: 20,
  },
});
