import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '@/components/M3/TopAppBar';
import { Colors, Typography, Spacing } from '@/config/theme';

export default function Page() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.screen}>
      <TopAppBar title="About TokCred" showBack />
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Text style={styles.title}>About TokCred</Text>
        <Text style={styles.body}>TokCred is a pioneering decentralized platform designed to eliminate credential fraud and streamline the verification of academic achievements.</Text>
        <Text style={styles.body}>By leveraging the security and immutability of the Ethereum blockchain, we empower educational institutions to issue cryptographically secure digital diplomas, certificates, and badges.</Text>
        <Text style={styles.body}>Our mission is to give students true ownership over their academic records while allowing employers and universities to verify these credentials instantly, securely, and without relying on expensive third-party clearinghouses.</Text>
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
