import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/config/theme';

type Status = 'verified' | 'pending' | 'revoked';

type Props = {
  status: Status;
  label?: string;
  style?: ViewStyle;
};

const STATUS_CONFIG: Record<Status, { bg: string; text: string; defaultLabel: string }> = {
  verified: {
    bg: Colors.secondaryContainer,
    text: Colors.onSecondaryContainer,
    defaultLabel: 'Verified',
  },
  pending: {
    bg: Colors.surfaceContainerHigh,
    text: Colors.onSurfaceVariant,
    defaultLabel: 'Pending',
  },
  revoked: {
    bg: Colors.errorContainer,
    text: Colors.onErrorContainer,
    defaultLabel: 'Revoked',
  },
};

export default function Chip({ status, label, style }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.chip, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.label, { color: config.text }]}>
        {label ?? config.defaultLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  label: {
    ...Typography.labelMd,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
