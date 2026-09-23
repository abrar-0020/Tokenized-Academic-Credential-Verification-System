import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import Button from '@/components/M3/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';
import { CONTRACT_ADDRESS } from '@/config/contract';

export default function VerifiedCredential() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokenId, studentName, degree, institution, grade, issueDate } = useLocalSearchParams<{
    tokenId: string;
    studentName: string;
    degree: string;
    institution: string;
    grade: string;
    issueDate: string;
  }>();

  const handleShare = async () => {
    const url = `https://www.deoxys.in/public-verify?tokenId=${tokenId}`;
    await Share.share({ 
      message: `Verified credential #${tokenId}: ${degree} from ${institution}\n\nVerify it securely online: ${url}`
    });
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="Credential Verified" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl, paddingTop: Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Credential card — shimmer-like gradient header */}
        <View style={styles.credentialCard}>
          {/* Left accent bar */}
          <View style={styles.tertiaryAccent} />

          {/* Card header */}
          <View style={styles.cardHeader}>
            <View>
              <View style={styles.officialBadge}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.tertiaryContainer} />
                <Text style={styles.officialBadgeText}>VERIFIED AUTHENTIC</Text>
              </View>
              <Text style={styles.degreeTitle}>{degree}</Text>
              <Text style={styles.institutionName}>{institution}</Text>
            </View>
            <View style={styles.sealCircle}>
              <Ionicons name="school" size={28} color={Colors.tertiaryContainer} />
            </View>
          </View>

          {/* Card body */}
          <View style={styles.cardBody}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>ISSUED TO</Text>
              <Text style={styles.fieldValue}>{studentName}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>ISSUE DATE</Text>
              <Text style={styles.fieldValue}>{issueDate || 'N/A'}</Text>
            </View>
            {grade ? (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>GRADE</Text>
                <Text style={styles.fieldValue}>{grade}</Text>
              </View>
            ) : null}
            <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: Colors.outlineVariant + '30', paddingTop: Spacing.md }]}>
              <Text style={styles.fieldLabel}>CREDENTIAL ID</Text>
              <Text style={[styles.fieldValue, { fontFamily: 'Inter_400Regular', fontSize: 12 }]}>#{tokenId}</Text>
            </View>
          </View>

          {/* Card footer */}
          <View style={styles.cardFooter}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="sparkles" size={16} color={Colors.primaryContainer} />
              <Text style={styles.verifiedBadgeText}>Secured by Blockchain</Text>
            </View>
            <Text style={styles.networkLabel}>Ethereum</Text>
          </View>
        </View>

        {/* Ledger proof block before action grid */}
        <View style={styles.blockchainCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md }}>
            <Ionicons name="server" size={20} color={Colors.onSurfaceVariant} />
            <Text style={[styles.cardTitle, { color: Colors.onSurfaceVariant, opacity: 0.8, marginBottom: 0 }]}>
              Ledger Proof
            </Text>
          </View>
          <View style={styles.blockchainRow}>
            <View>
              <Text style={styles.blockchainLabel}>Network</Text>
              <View style={styles.networkBadge}>
                <View style={styles.networkDot} />
                <Text style={styles.blockchainValue}>Ethereum Sepolia</Text>
              </View>
            </View>
          </View>
          <View style={styles.blockchainRow}>
            <Text style={styles.blockchainLabel}>Token ID</Text>
            <Text style={[styles.blockchainValue, { fontFamily: 'Inter_400Regular' }]}>#{tokenId}</Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`)}>
            <Text style={styles.explorerLink}>View on Explorer →</Text>
          </TouchableOpacity>
        </View>

        {/* Action grid */}
        <View style={styles.actionGrid}>
          <Button
            label="Share Verification"
            onPress={handleShare}
            variant="filled"
            fullWidth
          />
          <Button
            label="Show QR Code"
            onPress={() => router.push(`/qr/${tokenId}`)}
            variant="outlined"
            fullWidth
          />
          <Button
            label="Verify Another"
            onPress={() => router.replace('/verify')}
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
  content: { padding: Spacing.md, alignItems: 'center' },
  credentialCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    flexDirection: 'column',
    ...Shadow.level2,
  },
  tertiaryAccent: { height: 6, backgroundColor: Colors.tertiaryContainer },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '20',
  },
  officialBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  officialBadgeIcon: { fontSize: 14, color: Colors.tertiaryContainer },
  officialBadgeText: { ...Typography.labelMd, color: Colors.tertiaryContainer, letterSpacing: 1.5 },
  degreeTitle: { ...Typography.headlineLgMobile, color: Colors.onSurface, maxWidth: 220 },
  institutionName: { ...Typography.bodyLg, color: Colors.onSurfaceVariant },
  sealCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.tertiaryContainer + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealIcon: { fontSize: 24, color: Colors.tertiaryContainer },
  cardBody: { padding: Spacing.lg, gap: Spacing.md },
  fieldRow: { gap: Spacing.xs },
  fieldLabel: { ...Typography.labelMd, color: Colors.outline, letterSpacing: 1, textTransform: 'uppercase' },
  fieldValue: { ...Typography.bodyLg, color: Colors.onSurface, fontWeight: '500' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant + '20',
  },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  verifiedBadgeIcon: { fontSize: 14 },
  verifiedBadgeText: { ...Typography.labelMd, color: Colors.primaryContainer },
  networkLabel: { ...Typography.labelMd, color: Colors.outline },
  actionGrid: { width: '100%', maxWidth: 480, gap: Spacing.sm },
  blockchainCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.outlineVariant,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
  },
  cardTitle: { ...Typography.titleLg, color: Colors.primary, marginBottom: Spacing.md },
  blockchainRow: { marginBottom: Spacing.sm },
  blockchainLabel: { ...Typography.labelMd, color: Colors.outline },
  blockchainValue: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  networkBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  networkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  explorerLink: { ...Typography.labelMd, color: Colors.primary, marginTop: Spacing.sm },
});
