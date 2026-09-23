import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopAppBar from '@/components/M3/TopAppBar';
import Button from '@/components/M3/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';

export default function PublicVerifier() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tokenId, setTokenId] = useState('');

  const handleVerify = () => {
    const id = tokenId.trim();
    if (!id || isNaN(Number(id))) {
      Alert.alert('Invalid ID', 'Please enter a valid numeric Credential ID.');
      return;
    }
    router.push({ pathname: '/verifying', params: { tokenId: id } });
  };

  const handleScanQR = () => {
    router.push('/qr/scan');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopAppBar title="Verify Credential" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconRing}>
            <Ionicons name="search" size={28} color={Colors.primaryContainer} />
          </View>
          <Text style={styles.title}>Verify Academic Credential</Text>
          <Text style={styles.subtitle}>
            No wallet required. Enter a Credential ID or scan a QR code for an instant result.
          </Text>
        </View>

        {/* Input card */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Credential ID</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 42"
              value={tokenId}
              onChangeText={setTokenId}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleVerify}
              placeholderTextColor={Colors.outline}
            />
          </View>

          <Button
            label="Verify Credential"
            onPress={handleVerify}
            fullWidth
            variant="filled"
            style={{ marginTop: Spacing.md }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.qrButton} onPress={handleScanQR} activeOpacity={0.8}>
            <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
            <Text style={styles.qrLabel}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Info chips */}
        <View style={styles.infoRow}>
          {INFO_ITEMS.map((item, i) => (
            <View key={i} style={styles.infoChip}>
              <Ionicons name={item.icon as any} size={16} color={Colors.onSurfaceVariant} />
              <Text style={styles.infoChipText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const INFO_ITEMS = [
  { icon: 'flash', label: 'Instant' },
  { icon: 'lock-closed', label: 'Secure' },
  { icon: 'checkmark-circle', label: 'Free' },
];

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  heroIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondaryContainer,
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
    maxWidth: 320,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
    marginBottom: Spacing.lg,
    ...Shadow.level1,
  },
  inputLabel: {
    ...Typography.labelMd,
    color: Colors.outline,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  inputRow: {
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  input: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant + '40',
  },
  dividerText: {
    ...Typography.labelMd,
    color: Colors.outline,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '60',
    backgroundColor: Colors.surface,
  },
  qrLabel: {
    ...Typography.labelLg,
    color: Colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  infoChipText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
});
