import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';

/** Tertiary gold seal — used on credential_details screen */
export default function CredentialSeal({ id, size = 'large' }: { id?: string; size?: 'small' | 'large' }) {
  const isSmall = size === 'small';
  const graphicSize = isSmall ? 64 : 140;

  return (
    <View style={[styles.container, isSmall && { marginBottom: 0 }]}>
      {/* Seal Graphic Wrapper */}
      <View style={[styles.sealGraphic, { width: graphicSize, height: graphicSize, marginBottom: isSmall ? 0 : Spacing.md }]}>
        <View style={[styles.outerRing, { width: graphicSize, height: graphicSize, borderRadius: graphicSize / 2, borderWidth: isSmall ? 2 : 4 }]} />
        <View style={[styles.dashedRing, { width: graphicSize - (isSmall ? 10 : 16), height: graphicSize - (isSmall ? 10 : 16), borderRadius: graphicSize / 2, borderWidth: isSmall ? 1 : 2 }]} />
        <View style={[styles.innerCircle, { width: graphicSize - (isSmall ? 24 : 44), height: graphicSize - (isSmall ? 24 : 44), borderRadius: graphicSize / 2 }]}>
          <Ionicons name="ribbon" size={isSmall ? 24 : 56} color={Colors.onTertiary} />
        </View>
      </View>
      
      {/* Labels below the seal (only for large) */}
      {!isSmall && (
        <>
          <Text style={styles.label}>Official Record</Text>
          {id ? <Text style={styles.id}>ID: {id}</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  sealGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderColor: Colors.tertiaryContainer + '30',
  },
  dashedRing: {
    position: 'absolute',
    borderColor: Colors.tertiaryContainer + '60',
    borderStyle: 'dashed',
  },
  innerCircle: {
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: Colors.onTertiary,
  },
  label: {
    ...Typography.labelMd,
    color: Colors.tertiaryContainer,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  id: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
