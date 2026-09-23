import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import WalletOption from '@/components/Wallet/WalletOption';
import { useWallet } from '@/context/WalletContext';
import { Colors, Typography, Spacing, Radius } from '@/config/theme';

export default function WalletConnect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { connectWallet, loading, error } = useWallet();

  const handleConnect = async (walletName: string) => {
    await connectWallet();
    if (!error) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="Connect Wallet" showBack />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconRing}>
            <Ionicons name="lock-closed" size={36} color={Colors.onPrimaryContainer} />
          </View>
          <Text style={styles.title}>Connect Your Wallet</Text>
          <Text style={styles.subtitle}>
            Link your wallet to access your credentials and verify your identity on-chain.
          </Text>
        </View>

        {/* Wallet options */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose Wallet</Text>

          <WalletOption
            icon="🦊"
            name="MetaMask"
            description="Connect via MetaMask mobile app"
            onPress={() => handleConnect('MetaMask')}
          />
          <WalletOption
            icon="🔵"
            name="Coinbase Wallet"
            description="Connect via Coinbase Wallet app"
            onPress={() => handleConnect('Coinbase')}
          />
          <WalletOption
            icon="🌐"
            name="WalletConnect"
            description="Scan QR to connect any wallet"
            onPress={() => handleConnect('WalletConnect')}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Security note */}
        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={18} color={Colors.onSurfaceVariant} style={{ marginTop: 2 }} />
          <Text style={styles.noteText}>
            CredentialVault never stores your private key. Connection is read-only until you initiate a transaction.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 300,
  },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    ...Typography.labelMd,
    color: Colors.outline,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  errorBox: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Colors.onErrorContainer,
  },
  noteBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '40',
  },
  noteText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
});
