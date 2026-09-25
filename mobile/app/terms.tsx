import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '@/components/M3/TopAppBar';
import { Colors, Typography, Spacing } from '@/config/theme';

export default function Page() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.screen}>
      <TopAppBar title="Terms of Service" showBack />
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.body}>Last Updated: September 2026</Text>
        <Text style={styles.body}>By accessing or using the TokCred app, you agree to be bound by these Terms of Service.</Text>
        <Text style={styles.body}>1. User Responsibilities You are solely responsible for maintaining the security of your crypto wallet and private keys. TokCred cannot recover lost credentials if you lose access to your wallet.</Text>
        <Text style={styles.body}>2. Credential Authenticity TokCred provides the infrastructure for verifiable credentials. We do not independently verify the underlying truth of the academic achievements. The issuing institution is solely responsible for the accuracy of the credentials they issue.</Text>
        <Text style={styles.body}>3. Decentralized Nature TokCred interacts with decentralized smart contracts. While we strive for maximum uptime, we are not responsible for network congestion, gas fees, or downtime on the Ethereum blockchain.</Text>
        <Text style={styles.body}>4. Revocation Institutions retain the right to revoke credentials if they were issued in error or if the student violates the institution's academic integrity policies.</Text>
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
