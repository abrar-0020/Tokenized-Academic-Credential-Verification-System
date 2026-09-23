import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '@/config/theme';

type AccentColor = 'primary' | 'tertiary' | 'secondary' | 'error' | 'none';

type Props = {
  children: React.ReactNode;
  accentBar?: AccentColor;
  elevated?: boolean;
  style?: ViewStyle;
};

export default function Card({ children, accentBar = 'none', elevated = false, style }: Props) {
  const accentColor: Record<AccentColor, string> = {
    primary: Colors.primaryContainer,
    tertiary: Colors.tertiaryContainer,
    secondary: Colors.secondaryContainer,
    error: Colors.error,
    none: 'transparent',
  };

  return (
    <View style={[styles.card, elevated && Shadow.level2, style]}>
      {accentBar !== 'none' && (
        <View style={[styles.accentBar, { backgroundColor: accentColor[accentBar] }]} />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
    overflow: 'hidden',
    flexDirection: 'row',
    ...Shadow.level1,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
