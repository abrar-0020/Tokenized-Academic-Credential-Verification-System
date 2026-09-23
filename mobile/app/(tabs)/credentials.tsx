import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import CredentialCard from '@/components/Credential/CredentialCard';
import { useWallet } from '@/context/WalletContext';
import { getStudentCredentialIds, getCredentialDetails } from '@/services/blockchain/credentials';
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

export default function CredentialsLibrary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account } = useWallet();
  const [credentials, setCredentials] = useState<CredItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account) return;
    const load = async () => {
      setLoading(true);
      try {
        const ids = await getStudentCredentialIds(account);
        const items: CredItem[] = [];
        for (const id of ids) {
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
        }
        setCredentials(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [account]);

  if (!account) {
    return (
      <View style={styles.screen}>
        <TopAppBar title="My Credentials" />
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={48} color={Colors.outline} style={{ marginBottom: Spacing.sm }} />
          <Text style={styles.emptyTitle}>Connect Wallet First</Text>
          <Text style={styles.emptyDesc}>Connect your wallet to view your credentials.</Text>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => router.push('/wallet-connect')}
          >
            <Text style={styles.connectBtnText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopAppBar title="My Credentials" />
      <FlatList
        data={credentials}
        keyExtractor={item => item.tokenId}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.count}>
              {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <Text style={styles.loadingText}>Loading your credentials…</Text>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.outline} style={{ marginBottom: Spacing.sm }} />
              <Text style={styles.emptyTitle}>No credentials found</Text>
              <Text style={styles.emptyDesc}>No credentials have been issued to this wallet.</Text>
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
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.md },
  header: { paddingVertical: Spacing.lg },
  count: { ...Typography.labelMd, color: Colors.outline, letterSpacing: 0.5 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    margin: Spacing.md,
  },
  emptyTitle: { ...Typography.titleLg, color: Colors.onSurface, textAlign: 'center', fontSize: 16 },
  emptyDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  loadingText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', padding: Spacing.xl },
  connectBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
  },
  connectBtnText: { ...Typography.labelLg, color: Colors.onPrimary },
});
