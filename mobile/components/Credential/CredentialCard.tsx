import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Chip from '@/components/M3/Chip';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';
import { shortenAddress, formatDate } from '@/utils/helpers';

type Props = {
  tokenId: string;
  degree?: string;
  institution?: string;
  studentAddress?: string;
  issueDate?: bigint | number;
  revoked?: boolean;
  onRevoke?: (tokenId: string) => void; // only shown if provided (issuer view)
};

export default function CredentialCard({
  tokenId,
  degree = 'Academic Credential',
  institution = 'Issuing Institution',
  studentAddress,
  issueDate,
  revoked = false,
  onRevoke,
}: Props) {
  const router = useRouter();
  const status = revoked ? 'revoked' : 'verified';

  const handleRevoke = () => {
    Alert.alert(
      'Revoke Credential',
      `Are you sure you want to revoke credential #${tokenId}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => onRevoke?.(tokenId),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, revoked && styles.cardRevoked]}
      onPress={() => router.push(`/credential/${tokenId}`)}
      activeOpacity={0.85}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: revoked ? Colors.error : Colors.primaryContainer }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Chip status={status} />
          <Text style={styles.tokenId}>#{tokenId}</Text>
        </View>

        <Text style={styles.degree} numberOfLines={1}>{degree}</Text>
        <Text style={styles.institution} numberOfLines={1}>{institution}</Text>

        <View style={styles.footer}>
          {studentAddress ? (
            <Text style={styles.meta}>{shortenAddress(studentAddress)}</Text>
          ) : null}
          {issueDate ? (
            <Text style={styles.meta}>{formatDate(issueDate)}</Text>
          ) : null}
        </View>
      </View>

      {/* Right side: revoke button (issuer) OR chevron */}
      <View style={styles.trailing}>
        {onRevoke && !revoked ? (
          <TouchableOpacity
            style={styles.revokeBtn}
            onPress={handleRevoke}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ban" size={18} color={Colors.error} />
            <Text style={styles.revokeBtnText}>Revoke</Text>
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={24} color={Colors.outline} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.level1,
  },
  cardRevoked: {
    opacity: 0.65,
  },
  accentBar: { width: 4 },
  content: { flex: 1, padding: Spacing.md, gap: Spacing.xs },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.xs,
  },
  degree: { ...Typography.titleLg, color: Colors.onSurface },
  institution: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  meta: { ...Typography.labelMd, color: Colors.outline },
  tokenId: { ...Typography.labelMd, color: Colors.outline },
  trailing: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  revokeBtn: {
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.errorContainer + '66',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  revokeBtnText: { ...Typography.labelMd, color: Colors.error, fontSize: 11 },
});
