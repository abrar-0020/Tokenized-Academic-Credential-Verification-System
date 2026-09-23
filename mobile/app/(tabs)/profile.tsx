import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import Button from '@/components/M3/Button';
import { useWallet } from '@/context/WalletContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';
import { shortenAddress } from '@/utils/helpers';

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, isIssuer, isAdmin, disconnectWallet } = useWallet();

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnectWallet();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!account) {
    return (
      <View style={styles.screen}>
        <TopAppBar title="Profile" />
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.outline} style={{ marginBottom: Spacing.md }} />
          <Text style={styles.noWalletTitle}>No Wallet Connected</Text>
          <Text style={styles.noWalletDesc}>Connect a wallet to view your profile and credentials.</Text>
          <Button
            label="Connect Wallet"
            onPress={() => router.push('/wallet-connect')}
            variant="filled"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopAppBar title="Profile" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarChar}>{account[2]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.walletLabel}>Connected Wallet</Text>
          <Text style={styles.walletAddress}>{shortenAddress(account, 6)}</Text>

          {/* Role badges */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.onSecondaryContainer} />
              <Text style={styles.badgeText}>Verified Student</Text>
            </View>
            {isIssuer && (
              <View style={[styles.badge, styles.badgeIssuer]}>
                <Ionicons name="ribbon" size={14} color={Colors.onTertiary} />
                <Text style={[styles.badgeText, { color: Colors.onTertiary }]}>Issuer</Text>
              </View>
            )}
            {isAdmin && (
              <View style={[styles.badge, styles.badgeAdmin]}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.onError} />
                <Text style={[styles.badgeText, { color: Colors.onError }]}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuCard}>
          <MenuItem
            icon="document-text"
            label="My Credentials"
            onPress={() => router.push('/(tabs)/credentials')}
          />
          <MenuItem
            icon="search"
            label="Verify a Credential"
            onPress={() => router.push('/verify')}
          />
          {/* Issuer Console — only visible if ISSUER_ROLE */}
          {isIssuer && (
            <MenuItem
              icon="business"
              label="Issuer Console"
              description="Issue & manage credentials"
              onPress={() => router.push('/issue')}
              highlight
            />
          )}
          {isAdmin && (
            <MenuItem
              icon="settings"
              label="Admin Panel"
              description="Manage roles & settings"
              onPress={() => {}}
            />
          )}
        </View>

        {/* Disconnect */}
        <Button
          label="Disconnect Wallet"
          onPress={handleDisconnect}
          variant="outlined"
          fullWidth
          style={styles.disconnectBtn}
        />

        <Text style={styles.footer}>TokCred · Powered by Ethereum</Text>
      </ScrollView>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  description,
  onPress,
  highlight = false,
}: {
  icon: string;
  label: string;
  description?: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, highlight && styles.menuItemHighlight]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={22} color={highlight ? Colors.primary : Colors.onSurfaceVariant} style={{ width: 32 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, highlight && { color: Colors.primary, fontWeight: '600' }]}>
          {label}
        </Text>
        {description ? <Text style={styles.menuDesc}>{description}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.outline} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  noWalletTitle: { ...Typography.headlineLgMobile, color: Colors.onSurface, textAlign: 'center' },
  noWalletDesc: { ...Typography.bodyLg, color: Colors.onSurfaceVariant, textAlign: 'center', maxWidth: 280 },
  profileCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    ...Shadow.level1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarChar: { fontSize: 36, color: Colors.onPrimary },
  walletLabel: { ...Typography.labelMd, color: Colors.outline, marginBottom: Spacing.xs, letterSpacing: 1, textTransform: 'uppercase' },
  walletAddress: { ...Typography.titleLg, color: Colors.onSurface, marginBottom: Spacing.md, fontSize: 16 },
  badges: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeIssuer: { backgroundColor: Colors.tertiaryContainer },
  badgeAdmin: { backgroundColor: Colors.errorContainer },
  badgeText: { ...Typography.labelMd, color: Colors.onSecondaryContainer },
  menuCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    marginBottom: Spacing.lg,
    ...Shadow.level1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '20',
  },
  menuItemHighlight: {
    backgroundColor: Colors.secondaryContainer + '40',
  },
  menuLabel: { ...Typography.bodyLg, color: Colors.onSurface, fontSize: 15 },
  menuDesc: { ...Typography.labelMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  disconnectBtn: { marginBottom: Spacing.md },
  footer: { ...Typography.labelMd, color: Colors.outline, textAlign: 'center', marginBottom: Spacing.md },
});
