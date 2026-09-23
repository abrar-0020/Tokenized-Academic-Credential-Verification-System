import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import TopAppBar from '@/components/M3/TopAppBar';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';

export default function CredentialQR() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // QR value encodes the credential ID so any verifier can scan and verify
  const qrValue = `tokcred://verify/${id}`;

  const handleShare = async () => {
    await Share.share({
      message: `Verify my credential #${id}: ${qrValue}`,
    });
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="TokCred" showBack />
      <View style={[styles.center, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.card}>
          {/* Gradient accent bar */}
          <View style={styles.topAccent} />

          <View style={styles.content}>
            {/* Scanner icon */}
            <Text style={styles.scannerIcon}>📷</Text>
            <Text style={styles.title}>Scan to verify this credential</Text>
            <Text style={styles.subtitle}>No wallet or account required</Text>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={240}
                color={Colors.primary}
                backgroundColor="white"
              />
              {/* Scanning animation line — static for now */}
              <View style={styles.scanLine} />
            </View>

            {/* Credential summary */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>🎓</Text>
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryName}>Credential #{id}</Text>
                <Text style={styles.summaryDesc}>Tap to view full details</Text>
                <TouchableOpacity onPress={() => router.push(`/credential/${id}`)}>
                  <Text style={styles.summaryLink}>✓ View Details</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Share button */}
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareIcon}>↗</Text>
              <Text style={styles.shareLabel}>Share Link</Text>
            </TouchableOpacity>
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
    maxWidth: 400,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    overflow: 'hidden',
    ...Shadow.level2,
  },
  topAccent: {
    height: 4,
    backgroundColor: Colors.primaryContainer,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  scannerIcon: { fontSize: 40, marginBottom: Spacing.sm },
  title: { ...Typography.titleLg, color: Colors.onSurface, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.lg },
  qrContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
    marginBottom: Spacing.lg,
    alignItems: 'center',
    position: 'relative',
    ...Shadow.level1,
  },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '50%',
    height: 2,
    backgroundColor: Colors.primaryContainer + '60',
    borderRadius: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: { fontSize: 22 },
  summaryText: { flex: 1 },
  summaryName: { ...Typography.labelLg, color: Colors.onSurface },
  summaryDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  summaryLink: { ...Typography.labelMd, color: Colors.primary, marginTop: Spacing.xs },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  shareIcon: { fontSize: 18, color: Colors.primary },
  shareLabel: { ...Typography.labelLg, color: Colors.primary },
});
