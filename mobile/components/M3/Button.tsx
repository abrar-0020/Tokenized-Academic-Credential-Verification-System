import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/config/theme';

type Variant = 'filled' | 'outlined' | 'text' | 'tonal';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = 'filled',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: Props) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'filled' && styles.filled,
    variant === 'outlined' && styles.outlined,
    variant === 'text' && styles.text,
    variant === 'tonal' && styles.tonal,
    isDisabled && styles.disabled,
    fullWidth && { width: '100%' as const },
    style,
  ];

  const labelStyle = [
    styles.label,
    variant === 'filled' && styles.labelFilled,
    variant === 'outlined' && styles.labelOutlined,
    variant === 'text' && styles.labelText,
    variant === 'tonal' && styles.labelTonal,
    isDisabled && styles.labelDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={containerStyle}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'filled' ? Colors.onPrimary : Colors.primaryContainer}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={labelStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    minHeight: 48,
  },
  filled: {
    backgroundColor: Colors.primaryContainer,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.sm,
  },
  tonal: {
    backgroundColor: Colors.secondaryContainer,
  },
  disabled: {
    opacity: 0.38,
  },
  label: {
    ...Typography.labelLg,
    letterSpacing: 0.1,
  },
  labelFilled: {
    color: Colors.onPrimary,
  },
  labelOutlined: {
    color: Colors.primary,
  },
  labelText: {
    color: Colors.primary,
  },
  labelTonal: {
    color: Colors.onSecondaryContainer,
  },
  labelDisabled: {
    opacity: 0.6,
  },
});
