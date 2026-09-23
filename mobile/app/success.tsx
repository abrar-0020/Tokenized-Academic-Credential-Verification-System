import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '@/components/M3/TopAppBar';
import Button from '@/components/M3/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';
import { shortenHash } from '@/utils/helpers';

export default function CredentialIssued() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokenId, txHash } = useLocalSearchParams<{ tokenId: string; txHash: string }>();

  const handleShare = async () => {
    await Share.share({
      message: `Credential #${tokenId} has been issued and recorded on the blockchain. Transaction: ${txHash}`,
    });
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="Credential Issued" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>✓ Credential Issued</Text>
        <Text style={styles.subtitle}>
          The academic credential has been successfully recorded on the blockchain.
        </Text>

        {/* Details card with left accent bar */}
        <View style={styles.detailCard}>
          <View style={styles.accentBar} />
          <View style={styles.detailContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Credential ID</Text>
              <Text style={styles.detailValue}>#{tokenId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Hash</Text>
              <Text style={[styles.detailValue, { fontFamily: 'Inter_400Regular', fontSize: 12 }]}>
                {shortenHash(txHash || '', 6)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="View Credential"
            onPress={() => router.push(`/credential/${tokenId}`)}
            variant="filled"
            fullWidth
          />
          <Button
            label="Share"
            onPress={handleShare}
            variant="outlined"
            fullWidth
          />
          <Button
            label="Issue Another"
            onPress={() => router.replace('/issue')}
            variant="text"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadow.level1,
  },
  checkmark: { fontSize: 44, color: Colors.primaryContainer },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  detailCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    ...Shadow.level1,
  },
  accentBar: { width: 4, backgroundColor: Colors.tertiary },
  detailContent: { flex: 1, padding: Spacing.md, gap: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { ...Typography.labelMd, color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { ...Typography.bodyMd, color: Colors.onSurface, fontWeight: '600' },
  actions: { width: '100%', maxWidth: 480, gap: Spacing.sm },
});
