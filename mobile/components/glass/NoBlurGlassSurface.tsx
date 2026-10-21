import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface NoBlurGlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  heroGradient?: boolean;
}

export const NoBlurGlassSurface: React.FC<NoBlurGlassSurfaceProps> = ({
  children,
  style,
  borderRadius = 22,
  heroGradient = false,
}) => {
  const gradientColors = heroGradient
    ? (['rgba(255,255,255,0.18)', 'rgba(59,140,255,0.22)'] as const)
    : (['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'] as const);

  return (
    // Layer 1: Outer drop shadow container
    <View style={[styles.outerShadow, { borderRadius }, style]}>
      {/* Layer 2: Clipped backdrop layers */}
      <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>
        {/* Semi-translucent dark base tone allowing background glows to shine through */}
        <View style={[StyleSheet.absoluteFill, styles.baseBackdrop]} />

        {/* 145° Specular Gradient */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Inset inner ambient glow */}
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top rim highlight line */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.40)',
            'rgba(255,255,255,0)',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.topRim}
        />

        {/* Bottom edge subtle line */}
        <View style={styles.bottomEdge} />
      </View>

      {/* Layer 3: Border overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.borderOverlay,
          { borderRadius },
        ]}
        pointerEvents="none"
      />

      {/* Layer 4: Children with padding */}
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
  baseBackdrop: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
