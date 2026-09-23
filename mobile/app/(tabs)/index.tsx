import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import CredentialCard from '@/components/Credential/CredentialCard';
import { useWallet } from '@/context/WalletContext';
import { getStudentCredentialIds, getCredentialDetails } from '@/services/blockchain/credentials';
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

export default function StudentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, disconnectWallet } = useWallet();
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
    loadCreds();
  }, [account]);

  const verifiedCount = credentials.filter(c => !c.revoked).length;

  const AvatarTrailing = (
    <TouchableOpacity
      style={styles.avatarBtn}
      onPress={() => router.push('/(tabs)/profile')}
    >
      <Text style={styles.avatarText}>{account ? account[2].toUpperCase() : '?'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <TopAppBar trailing={AvatarTrailing} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingLabel}>Welcome back,</Text>
          <Text style={styles.greetingAddress}>
            {account ? shortenAddress(account) : 'Student'}
          </Text>
        </View>

        {/* Stats bento grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statNumber}>{verifiedCount}</Text>
            <Text style={styles.statLabel}>Verified{'\n'}Credentials</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{credentials.length}</Text>
            <Text style={styles.statLabel}>Total{'\n'}Records</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.onSurface} style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>Identity{'\n'}Verified</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/verify')}
          >
            <Ionicons name="search" size={24} color={Colors.onSurfaceVariant} style={{ marginBottom: Spacing.xs }} />
            <Text style={styles.quickActionLabel}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/credentials')}
          >
            <Ionicons name="document-text" size={24} color={Colors.onSurfaceVariant} style={{ marginBottom: Spacing.xs }} />
            <Text style={styles.quickActionLabel}>Credentials</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person" size={24} color={Colors.onSurfaceVariant} style={{ marginBottom: Spacing.xs }} />
            <Text style={styles.quickActionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent credentials */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Credentials</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/credentials')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Loading credentials…</Text>
          ) : credentials.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.outline} style={{ marginBottom: Spacing.sm }} />
              <Text style={styles.emptyTitle}>No credentials yet</Text>
              <Text style={styles.emptyDesc}>
                Credentials issued to your wallet will appear here.
              </Text>
            </View>
          ) : (
            credentials.slice(0, 3).map(cred => (
              <CredentialCard
                key={cred.tokenId}
                tokenId={cred.tokenId}
                degree={cred.degree}
                institution={cred.institution}
                studentAddress={cred.student}
                issueDate={cred.issueTimestamp}
                revoked={cred.revoked}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.labelLg, color: Colors.onPrimary },
  greeting: { paddingTop: Spacing.lg, marginBottom: Spacing.lg },
  greetingLabel: { ...Typography.bodyLg, color: Colors.onSurfaceVariant },
  greetingAddress: { ...Typography.headlineLgMobile, color: Colors.onSurface },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    ...Shadow.level1,
  },
  statCardPrimary: {
    backgroundColor: Colors.primaryContainer,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 36,
  },
  statLabel: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
  },
  quickActionIcon: { fontSize: 22, marginBottom: Spacing.xs },
  quickActionLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.titleLg, color: Colors.onSurface, fontSize: 16 },
  seeAll: { ...Typography.labelLg, color: Colors.primary },
  loadingText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', padding: Spacing.lg },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
  },
  emptyTitle: { ...Typography.titleLg, color: Colors.onSurface, marginBottom: Spacing.xs, fontSize: 16 },
  emptyDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
