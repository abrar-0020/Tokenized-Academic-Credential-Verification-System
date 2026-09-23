import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import Button from '@/components/M3/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';

export default function VerificationFailed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reason, tokenId } = useLocalSearchParams<{ reason: string; tokenId: string }>();

  const isRevoked = reason === 'revoked';
  const isNetwork = reason === 'network';
  const isNotFound = !isRevoked && !isNetwork;

  return (
    <View style={styles.screen}>
      <TopAppBar title="Verification Result" showBack />
      <View style={[styles.center, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {/* Card */}
        <View style={styles.card}>
          {/* Top accent bar */}
          <View style={styles.topAccent} />

          <View style={styles.cardContent}>
            {/* Error icon */}
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Ionicons
                  name={isNetwork ? 'wifi-outline' : isRevoked ? 'warning-outline' : 'close'}
                  size={32}
                  color={Colors.onError}
                />
              </View>
              <View style={styles.badgeIcon}>
                <Ionicons name="close" size={16} color={Colors.onError} />
              </View>
            </View>

            {/* Status chip */}
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>
                {isNetwork ? '⚠ NO INTERNET' : (isRevoked ? '⚠ REVOKED' : '⚠ NOT FOUND')}
              </Text>
            </View>

            {/* Headline */}
            <Text style={styles.title}>
              {isNetwork ? 'Connection Error' : 'Credential Not Valid'}
            </Text>

            {/* Explanation */}
            <Text style={styles.explanation}>
              {isNetwork
                ? 'Please connect to mobile data or Wi-Fi to verify this credential. The app needs internet access to read the blockchain.'
                : isRevoked
                ? 'This credential has been marked as revoked by the issuing institution. It is no longer a valid proof of claim within the registry.'
                : `No credential was found for ID #${tokenId || '?'}. It may not exist or the ID may be incorrect.`}
            </Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Actions */}
            <Button
              label="Try Another Credential"
              onPress={() => router.replace('/verify')}
              variant="filled"
              fullWidth
            />
            <Button
              label="Go to Home"
              onPress={() => router.replace('/')}
              variant="outlined"
              fullWidth
              style={{ marginTop: Spacing.sm }}
            />
          </View>

          {/* Card footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>Verified by TokCred Protocol · Secure Ledger</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    overflow: 'hidden',
    ...Shadow.level2,
  },
  topAccent: { height: 4, backgroundColor: Colors.tertiaryContainer },
  cardContent: { padding: Spacing.lg, alignItems: 'center' },
  iconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.errorContainer + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIcon: { fontSize: 28 },
  badgeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeText: { ...Typography.labelMd, color: Colors.onError, fontWeight: '700' },
  statusChip: {
    backgroundColor: Colors.errorContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  statusChipText: {
    ...Typography.labelMd,
    color: Colors.onErrorContainer,
    letterSpacing: 1.5,
  },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  explanation: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.outlineVariant + '30',
    marginBottom: Spacing.lg,
  },
  cardFooter: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant + '20',
    alignItems: 'center',
  },
  footerText: { ...Typography.labelMd, color: Colors.outline },
});
