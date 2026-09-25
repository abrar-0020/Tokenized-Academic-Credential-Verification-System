import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import CredentialCard from '@/components/Credential/CredentialCard';
import { useWallet } from '@/context/WalletContext';
import { getStudentCredentialIds, getCredentialDetails, revokeCredentialTx } from '@/services/blockchain/credentials';
import { getPublicContract } from '@/services/blockchain/provider';
import { fetchMetadata } from '@/services/ipfs/metadata';
import { Colors, Typography, Spacing, Radius } from '@/config/theme';

type CredItem = {
  tokenId: string;
  degree: string;
  institution: string;
  student: string;
  issueTimestamp: bigint;
  revoked: boolean;
};

async function loadAllCredentials(): Promise<CredItem[]> {
  const contract = getPublicContract();
  const total: bigint = await contract.getTotalCredentials();
  const items: CredItem[] = [];
  for (let i = 0n; i < total; i++) {
    try {
      const cred = await contract.getCredentialDetails(i);
      let degree = 'Academic Credential';
      let institution = 'Unknown Institution';
      try {
        const meta = await fetchMetadata(cred.metadataURI);
        degree = meta.degree || meta.name || degree;
        institution = meta.institution || institution;
      } catch {}
      items.push({
        tokenId: i.toString(),
        degree,
        institution,
        student: cred.student,
        issueTimestamp: cred.issueTimestamp,
        revoked: cred.revoked,
      });
    } catch {}
  }
  return items;
}

async function loadStudentCredentials(account: string): Promise<CredItem[]> {
  const ids = await getStudentCredentialIds(account);
  const items: CredItem[] = [];
  for (const id of ids) {
    try {
      const cred = await getCredentialDetails(id);
      let degree = 'Academic Credential';
      let institution = 'Unknown Institution';
      try {
        const meta = await fetchMetadata(cred.metadataURI);
        degree = meta.degree || meta.name || degree;
        institution = meta.institution || institution;
      } catch {}
      items.push({
        tokenId: id.toString(),
        degree,
        institution,
        student: cred.student,
        issueTimestamp: cred.issueTimestamp,
        revoked: cred.revoked,
      });
    } catch {}
  }
  return items;
}

export default function CredentialsLibrary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, isIssuer, isAdmin, signer } = useWallet();
  const isPrivileged = isIssuer || isAdmin;
  const [credentials, setCredentials] = useState<CredItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const items = isPrivileged
        ? await loadAllCredentials()
        : await loadStudentCredentials(account);
      setCredentials(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [account, isPrivileged]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = useCallback(async (tokenId: string) => {
    if (!signer) return;
    try {
      await revokeCredentialTx(signer, tokenId);
      setCredentials(prev => prev.map(c => c.tokenId === tokenId ? { ...c, revoked: true } : c));
    } catch (err: any) {
      const { Alert } = require('react-native');
      Alert.alert('Revoke Failed', err?.message ?? 'Transaction failed');
    }
  }, [signer]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (!account) {
    return (
      <View style={styles.screen}>
        <TopAppBar title={isPrivileged ? 'All Credentials' : 'My Credentials'} />
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={48} color={Colors.outline} style={{ marginBottom: Spacing.sm }} />
          <Text style={styles.emptyTitle}>Connect Wallet First</Text>
          <Text style={styles.emptyDesc}>Connect your wallet to view credentials.</Text>
          <TouchableOpacity style={styles.connectBtn} onPress={() => router.push('/wallet-connect')}>
            <Text style={styles.connectBtnText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopAppBar title={isPrivileged ? 'All Issued Credentials' : 'My Credentials'} />
      <FlatList
        data={credentials}
        keyExtractor={item => item.tokenId}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.count}>
              {loading ? 'Loading…' : credentials.length + ' credential' + (credentials.length !== 1 ? 's' : '')}
            </Text>
            {isPrivileged && (
              <TouchableOpacity style={styles.issueBtn} onPress={() => router.push('/issue')}>
                <Ionicons name="add" size={18} color={Colors.onPrimary} />
                <Text style={styles.issueBtnText}>Issue New</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <Text style={styles.loadingText}>Loading credentials…</Text>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.outline} style={{ marginBottom: Spacing.sm }} />
              <Text style={styles.emptyTitle}>No credentials found</Text>
              <Text style={styles.emptyDesc}>
                {isPrivileged ? 'No credentials have been issued yet.' : 'No credentials have been issued to this wallet.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <CredentialCard
            tokenId={item.tokenId}
            degree={item.degree}
            institution={item.institution}
            studentAddress={item.student}
            issueDate={item.issueTimestamp}
            revoked={item.revoked}
            onRevoke={isPrivileged ? handleRevoke : undefined}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  count: { ...Typography.labelMd, color: Colors.outline, letterSpacing: 0.5 },
  issueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  issueBtnText: { ...Typography.labelMd, color: Colors.onPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyCard: {
    alignItems: 'center', padding: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg, margin: Spacing.md,
  },
  emptyTitle: { ...Typography.titleLg, color: Colors.onSurface, textAlign: 'center', fontSize: 16 },
  emptyDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  loadingText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', padding: Spacing.xl },
  connectBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radius.lg, marginTop: Spacing.sm,
  },
  connectBtnText: { ...Typography.labelLg, color: Colors.onPrimary },
});
