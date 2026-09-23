import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '@/components/M3/TopAppBar';
import Button from '@/components/M3/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';
import { shortenAddress } from '@/utils/helpers';

export default function ReviewCredential() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { walletAddress, studentName, degree, institution, grade, issueDate } =
    useLocalSearchParams<{
      walletAddress: string;
      studentName: string;
      degree: string;
      institution: string;
      grade: string;
      issueDate: string;
    }>();

  const handleConfirm = () => {
    router.push({
      pathname: '/transaction',
      params: { walletAddress, studentName, degree, institution, grade, issueDate },
    });
  };

  const REVIEW_FIELDS = [
    { label: 'Student Wallet', value: shortenAddress(walletAddress) },
    { label: 'Student Name', value: studentName },
    { label: 'Degree', value: degree },
    { label: 'Institution', value: institution },
    { label: 'Grade', value: grade || 'N/A' },
    { label: 'Issue Date', value: issueDate },
  ];

  return (
    <View style={styles.screen}>
      <TopAppBar title="Review & Confirm" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Review Credential</Text>
          <Text style={styles.subtitle}>
            Please review all details carefully before signing the transaction.
            This action cannot be undone.
          </Text>
        </View>

        {/* Credential preview card */}
        <View style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: Colors.tertiaryContainer }]} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Credential Summary</Text>
            {REVIEW_FIELDS.map((item, i) => (
              <View key={i} style={[styles.row, i < REVIEW_FIELDS.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gas warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⛽</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Transaction Fee Required</Text>
            <Text style={styles.warningText}>
              Issuing a credential requires a gas fee. Your wallet will prompt you to approve the transaction.
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <Button
          label="Sign & Issue Credential"
          onPress={handleConfirm}
          variant="filled"
          fullWidth
          style={{ marginBottom: Spacing.sm }}
        />
        <Button
          label="Edit Details"
          onPress={() => router.back()}
          variant="outlined"
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  header: { marginBottom: Spacing.lg },
  title: { ...Typography.headlineLgMobile, color: Colors.onSurface, marginBottom: Spacing.sm },
  subtitle: { ...Typography.bodyLg, color: Colors.onSurfaceVariant },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    ...Shadow.level1,
  },
  accentBar: { width: 4 },
  cardContent: { flex: 1, padding: Spacing.lg },
  cardTitle: { ...Typography.titleLg, color: Colors.primary, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant + '50',
  },
  rowLabel: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  rowValue: { ...Typography.labelLg, color: Colors.onSurface, maxWidth: 180, textAlign: 'right' },
  warningBox: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  warningIcon: { fontSize: 22 },
  warningTitle: { ...Typography.labelLg, color: Colors.onSurface, marginBottom: Spacing.xs },
  warningText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
});
