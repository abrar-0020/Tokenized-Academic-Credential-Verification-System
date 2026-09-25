import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import Button from '@/components/M3/Button';
import CredentialCard from '@/components/Credential/CredentialCard';
import { useWallet } from '@/context/WalletContext';
import { getStudentCredentialIds, getCredentialDetails, revokeCredentialTx } from '@/services/blockchain/credentials';
import { getPublicContract } from '@/services/blockchain/provider';
import { fetchMetadata } from '@/services/ipfs/metadata';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';
import { shortenAddress } from '@/utils/helpers';

type CredentialItem = {
  tokenId: string;
  degree: string;
  institution: string;
  student: string;
  issueTimestamp: bigint;
  revoked: boolean;
};

// ─── Load all credentials for issuer/admin dashboard ─────────────────────────
async function loadAllCredentials(): Promise<CredentialItem[]> {
  const contract = getPublicContract();
  const total: bigint = await contract.getTotalCredentials();
  const items: CredentialItem[] = [];
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

// ─── Issuer / Admin Dashboard ─────────────────────────────────────────────────
function IssuerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, isIssuer, isAdmin, disconnectWallet, signer } = useWallet();
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await loadAllCredentials();
      setCredentials(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleRevoke = useCallback(async (tokenId: string) => {
    if (!signer) return;
    try {
      await revokeCredentialTx(signer, tokenId);
      setCredentials(prev => prev.map(c => c.tokenId === tokenId ? { ...c, revoked: true } : c));
    } catch (err: any) {
      const { Alert: RNAlert } = require('react-native');
      RNAlert.alert('Revoke Failed', err?.message ?? 'Transaction failed');
    }
  }, [signer]);

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect', style: 'destructive',
          onPress: async () => { await disconnectWallet(); router.replace('/'); },
        },
      ]
    );
  };

  const active = credentials.filter(c => !c.revoked).length;
  const revoked = credentials.filter(c => c.revoked).length;

  const ListHeader = (
    <>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarChar}>{account?.[2]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.walletLabel}>Connected Wallet</Text>
            <Text style={styles.walletAddress}>{account ? shortenAddress(account, 8) : '—'}</Text>
            <View style={styles.badges}>
              {isIssuer && (
                <View style={[styles.badge, styles.badgeIssuer]}>
                  <Ionicons name="ribbon" size={12} color={Colors.onTertiary} />
                  <Text style={[styles.badgeText, { color: Colors.onTertiary }]}>Issuer</Text>
                </View>
              )}
              {isAdmin && (
                <View style={[styles.badge, styles.badgeAdmin]}>
                  <Ionicons name="shield-checkmark" size={12} color={Colors.onErrorContainer} />
                  <Text style={[styles.badgeText, { color: Colors.onErrorContainer }]}>Admin</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectIcon}>
            <Ionicons name="log-out-outline" size={22} color={Colors.outline} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statPrimary]}>
          <Text style={[styles.statNumber, { color: Colors.onPrimary }]}>{credentials.length}</Text>
          <Text style={[styles.statLabel, { color: Colors.onPrimary + 'CC' }]}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.error }]}>{revoked}</Text>
          <Text style={styles.statLabel}>Revoked</Text>
        </View>
      </View>

      {/* Actions row */}
      <View style={styles.actionsRow}>
        {isIssuer && (
          <TouchableOpacity style={[styles.actionBtn, { flex: 2 }]} onPress={() => router.push('/issue')}>
            <Ionicons name="add-circle" size={20} color={Colors.onPrimary} />
            <Text style={styles.actionBtnText}>Issue New Credential</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtnOutline, { flex: 1 }]} onPress={() => router.push('/verify')}>
          <Ionicons name="search" size={18} color={Colors.primary} />
          <Text style={styles.actionBtnOutlineText}>Verify</Text>
        </TouchableOpacity>
      </View>

      {/* Stats summary */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionSub}>{loading ? 'Loading…' : credentials.length + ' total credential' + (credentials.length !== 1 ? 's' : '')}</Text>
      </View>
    </>
  );

  const recent = [...credentials].reverse().slice(0, 2);

  return (
    <View style={styles.screen}>
      <TopAppBar title="Issuer Portal" />
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {ListHeader}

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Credentials</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/credentials')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading credentials…</Text>
        ) : recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.outline} style={{ marginBottom: Spacing.sm }} />
            <Text style={styles.emptyTitle}>No credentials yet</Text>
            <Text style={styles.emptyDesc}>Credentials you issue will appear here.</Text>
          </View>
        ) : (
          recent.map(item => (
            <CredentialCard
              key={item.tokenId}
              tokenId={item.tokenId}
              degree={item.degree}
              institution={item.institution}
              studentAddress={item.student}
              issueDate={item.issueTimestamp}
              revoked={item.revoked}
              onRevoke={isIssuer || isAdmin ? handleRevoke : undefined}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account } = useWallet();
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account) return;
    const loadCreds = async () => {
      setLoading(true);
      try {
        const ids = await getStudentCredentialIds(account);
        const items: CredentialItem[] = [];
        for (const id of ids.slice(0, 10)) {
          const cred = await getCredentialDetails(id);
          let degree = 'Academic Credential';
          let institution = 'Unknown Institution';
          try {
            const meta = await fetchMetadata(cred.metadataURI);
            degree = meta.degree || meta.name || degree;
            institution = meta.institution || institution;
          } catch {}
          items.push({
            tokenId: id.toString(), degree, institution,
            student: cred.student, issueTimestamp: cred.issueTimestamp, revoked: cred.revoked,
          });
        }
        setCredentials(items);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadCreds();
  }, [account]);

  const verifiedCount = credentials.filter(c => !c.revoked).length;
  const AvatarTrailing = (
    <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
      <Text style={styles.avatarText}>{account ? account[2].toUpperCase() : '?'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <TopAppBar trailing={AvatarTrailing} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingLabel}>Welcome back,</Text>
          <Text style={styles.greetingAddress}>{account ? shortenAddress(account) : 'Student'}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <Text style={styles.statNumber}>{verifiedCount}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{credentials.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtnOutline, { flex: 1 }]} onPress={() => router.push('/verify')}>
            <Ionicons name="search" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnOutlineText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnOutline, { flex: 1 }]} onPress={() => router.push('/(tabs)/credentials')}>
            <Ionicons name="document-text" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnOutlineText}>Credentials</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Credentials</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/credentials')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text style={styles.loadingText}>Loading credentials…</Text>
        ) : credentials.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.outline} style={{ marginBottom: Spacing.sm }} />
            <Text style={styles.emptyTitle}>No credentials yet</Text>
            <Text style={styles.emptyDesc}>Credentials issued to your wallet will appear here.</Text>
          </View>
        ) : (
          credentials.slice(0, 3).map(cred => (
            <CredentialCard key={cred.tokenId} tokenId={cred.tokenId} degree={cred.degree}
              institution={cred.institution} studentAddress={cred.student}
              issueDate={cred.issueTimestamp} revoked={cred.revoked} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const { isIssuer, isAdmin } = useWallet();
  if (isIssuer || isAdmin) return <IssuerDashboard />;
  return <StudentDashboard />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.md },
  content: { paddingHorizontal: Spacing.md },
  // Profile card
  profileCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl,
    padding: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.outlineVariant + '20', ...Shadow.level1,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarChar: { fontSize: 22, color: Colors.onPrimary },
  walletLabel: { ...Typography.labelMd, color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.8 },
  walletAddress: { ...Typography.titleLg, color: Colors.onSurface, fontSize: 15 },
  badges: { flexDirection: 'row', gap: Spacing.xs, marginTop: 4 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full,
  },
  badgeIssuer: { backgroundColor: Colors.tertiaryContainer },
  badgeAdmin: { backgroundColor: Colors.errorContainer },
  badgeText: { ...Typography.labelMd, color: Colors.onSecondaryContainer, fontSize: 11 },
  disconnectIcon: { padding: Spacing.xs },
  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.outlineVariant + '20',
  },
  statPrimary: { backgroundColor: Colors.primaryContainer },
  statNumber: { fontSize: 24, fontWeight: '700', color: Colors.onSurface },
  statLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  // Actions
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs,
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
  },
  actionBtnText: { ...Typography.labelLg, color: Colors.onPrimary },
  actionBtnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
  },
  actionBtnOutlineText: { ...Typography.labelLg, color: Colors.primary },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.titleLg, color: Colors.onSurface, fontSize: 16 },
  sectionSub: { ...Typography.labelMd, color: Colors.outline },
  seeAll: { ...Typography.labelLg, color: Colors.primary },
  // Student
  greeting: { paddingTop: Spacing.lg, marginBottom: Spacing.md },
  greetingLabel: { ...Typography.bodyLg, color: Colors.onSurfaceVariant },
  greetingAddress: { ...Typography.headlineLgMobile, color: Colors.onSurface },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Typography.labelLg, color: Colors.onPrimary },
  // Empty/loading
  center: { alignItems: 'center', padding: Spacing.xl },
  emptyCard: {
    alignItems: 'center', padding: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.outlineVariant + '20',
    marginBottom: Spacing.md,
  },
  emptyTitle: { ...Typography.titleLg, color: Colors.onSurface, fontSize: 16 },
  emptyDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  loadingText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', padding: Spacing.lg },
});
