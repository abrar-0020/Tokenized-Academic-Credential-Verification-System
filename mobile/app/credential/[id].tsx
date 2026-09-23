import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import Chip from '@/components/M3/Chip';
import CredentialSeal from '@/components/Credential/CredentialSeal';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';
import { getCredentialDetails } from '@/services/blockchain/credentials';
import { fetchMetadata } from '@/services/ipfs/metadata';
import { formatDate, shortenAddress, shortenHash } from '@/utils/helpers';
import { CredentialData, CredentialMetadata, CONTRACT_ADDRESS } from '@/config/contract';

export default function CredentialDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [credential, setCredential] = useState<CredentialData | null>(null);
  const [metadata, setMetadata] = useState<CredentialMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cred = await getCredentialDetails(id);
        setCredential(cred);
        if (cred.metadataURI) {
          const meta = await fetchMetadata(cred.metadataURI);
          setMetadata(meta);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const degree = metadata?.degree || metadata?.name || 'Academic Credential';
  const institution = metadata?.institution || 'Issuing Institution';
  const studentName = metadata?.studentName || shortenAddress(credential?.student || '');
  const issueDate = metadata?.issueDate || (credential ? formatDate(credential.issueTimestamp) : 'N/A');

  const handleShare = async () => {
    const url = `https://www.deoxys.in/public-verify?tokenId=${id}`;
    await Share.share({ 
      message: `Verified credential #${id}: ${degree} from ${institution}\n\nVerify it securely online: ${url}`
    });
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="Credential Detail" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: title + status + actions */}
        <View style={styles.header}>
          <Chip status={credential?.revoked ? 'revoked' : 'verified'} label="Verified via Vault Network" />
          <Text style={styles.degree}>{degree}</Text>
          <Text style={styles.institution}>{institution}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.iconAction}
              onPress={() => router.push(`/qr/${id}`)}
            >
              <Ionicons name="qr-code" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}>
              <Ionicons name="link" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryAction} onPress={handleShare}>
              <Text style={styles.primaryActionText}>Share Credential</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification details card */}
        <View style={[styles.detailCard, { position: 'relative' }]}>
          {/* Elegant top-right seal */}
          <View style={{ position: 'absolute', top: Spacing.lg, right: Spacing.lg, opacity: 0.8 }}>
            <CredentialSeal size="small" />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md }}>
            <Ionicons name="search" size={20} color={Colors.primary} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Verification Details</Text>
          </View>
          <View style={[styles.detailGrid, { paddingRight: 64 }]}>
            {[
              { label: 'Recipient Name', value: studentName },
              { label: 'Date of Issue', value: issueDate },
              { label: 'Issuing Institution', value: institution },
              { label: 'Expiration', value: 'Does Not Expire' },
            ].map((item, i) => (
              <View key={i} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Academic record */}
        {metadata?.grade || metadata?.degree ? (
          <View style={styles.detailCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md }}>
              <Ionicons name="school" size={20} color={Colors.primary} />
              <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Academic Record</Text>
            </View>
            {[
              { label: 'Degree', value: metadata?.degree || 'N/A' },
              { label: 'Grade / Classification', value: metadata?.grade || 'N/A' },
            ].map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listLabel}>{item.label}</Text>
                <Text style={styles.listValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Blockchain record */}
        <View style={[styles.detailCard, styles.blockchainCard]}>
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
            <Text style={[styles.blockchainValue, { fontFamily: 'Inter_400Regular' }]}>#{id}</Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${id}`)}>
            <Text style={styles.explorerLink}>View on Explorer →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  header: { marginBottom: Spacing.lg, gap: Spacing.sm },
  degree: { ...Typography.headlineLgMobile, color: Colors.onSurface },
  institution: { ...Typography.titleLg, color: Colors.onSurfaceVariant },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  iconAction: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.level1,
  },
  iconActionIcon: { fontSize: 20 },
  primaryAction: {
    flex: 1,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    alignItems: 'center',
    ...Shadow.level1,
  },
  primaryActionText: { ...Typography.labelLg, color: Colors.onPrimary },
  sealCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    ...Shadow.level1,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    ...Shadow.level1,
  },
  blockchainCard: {
    borderLeftColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
  },
  cardTitle: { ...Typography.titleLg, color: Colors.primary, marginBottom: Spacing.md },
  detailGrid: { gap: Spacing.sm },
  detailItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant + '50',
    paddingBottom: Spacing.sm,
  },
  detailLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant, marginBottom: 2 },
  detailValue: { ...Typography.bodyLg, color: Colors.onSurface },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant + '50',
  },
  listLabel: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  listValue: { ...Typography.labelLg, color: Colors.onSurface },
  blockchainRow: { marginBottom: Spacing.sm },
  blockchainLabel: { ...Typography.labelMd, color: Colors.outline },
  blockchainValue: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  networkBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  networkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  explorerLink: { ...Typography.labelMd, color: Colors.primary, marginTop: Spacing.sm },
});
