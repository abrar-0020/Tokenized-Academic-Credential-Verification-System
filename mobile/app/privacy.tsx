import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '@/components/M3/TopAppBar';
import { Colors, Typography, Spacing } from '@/config/theme';

export default function Page() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.screen}>
      <TopAppBar title="Privacy Policy" showBack />
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.body}>Last Updated: September 2026</Text>
        <Text style={styles.body}>At TokCred, we take your privacy seriously. Because our core technology relies on public blockchains, we want to be transparent about how data is handled.</Text>
        <Text style={styles.body}>1. Blockchain Data When an institution issues a credential to your wallet, the transaction is recorded on the Ethereum blockchain. This means the issuance event is public and immutable. However, TokCred only stores cryptographic hashes on-chain, ensuring that your personal identity is not directly exposed to the public ledger.</Text>
        <Text style={styles.body}>2. Wallet Connections TokCred does not collect, store, or have access to your private keys. When you connect via WalletConnect, we only read your public wallet address to retrieve your credentials.</Text>
        <Text style={styles.body}>3. Third-Party Services We use WalletConnect infrastructure to facilitate wallet logins. Please refer to WalletConnect's privacy policy for details on their data handling.</Text>
        <Text style={styles.body}>If you have any questions about how your data is processed, please contact your issuing institution.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  title: { ...Typography.headlineMd, color: Colors.onSurface, marginBottom: Spacing.md },
  body: { ...Typography.bodyLg, color: Colors.onSurfaceVariant, lineHeight: 24, marginBottom: Spacing.md },
});
