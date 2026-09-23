import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '@/components/M3/TopAppBar';
import TextField from '@/components/M3/TextField';
import Button from '@/components/M3/Button';
import { useWallet } from '@/context/WalletContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';

type FormData = {
  walletAddress: string;
  studentName: string;
  degree: string;
  institution: string;
  grade: string;
  issueDate: string;
};

export default function IssueCredential() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isIssuer, account } = useWallet();

  const [form, setForm] = useState<FormData>({
    walletAddress: '',
    studentName: '',
    degree: '',
    institution: 'University of Technology',
    grade: '',
    issueDate: new Date().toISOString().split('T')[0],
  });

  const update = (key: keyof FormData) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleContinue = () => {
    if (!form.walletAddress || !form.studentName || !form.degree || !form.institution) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(form.walletAddress)) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum wallet address.');
      return;
    }
    router.push({ pathname: '/review', params: form });
  };

  if (!isIssuer) {
    return (
      <View style={styles.screen}>
        <TopAppBar title="Issue Credential" showBack />
        <View style={styles.center}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Issuer Access Required</Text>
          <Text style={styles.lockDesc}>
            Your connected wallet does not have the ISSUER_ROLE for this contract.
            Contact the contract admin to grant access.
          </Text>
          <Button label="Go Back" onPress={() => router.back()} variant="outlined" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopAppBar title="Issue Credential" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Issue New Credential</Text>
          <Text style={styles.pageSubtitle}>
            Fill in the details to generate and issue a secure, verifiable credential.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Recipient Details</Text>

          <TextField
            label="Student Wallet Address"
            value={form.walletAddress}
            onChangeText={update('walletAddress')}
            placeholder=" "
            autoCapitalize="none"
          />
          <TextField
            label="Student Name"
            value={form.studentName}
            onChangeText={update('studentName')}
            placeholder=" "
          />

          <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Academic Record</Text>

          <TextField
            label="Degree / Certificate Name"
            value={form.degree}
            onChangeText={update('degree')}
            placeholder=" "
          />
          <TextField
            label="Issuing Institution"
            value={form.institution}
            onChangeText={update('institution')}
            placeholder=" "
          />
          <TextField
            label="Grade / Classification"
            value={form.grade}
            onChangeText={update('grade')}
            placeholder=" "
          />
          <TextField
            label="Issue Date (YYYY-MM-DD)"
            value={form.issueDate}
            onChangeText={update('issueDate')}
            placeholder=" "
            keyboardType="numeric"
          />

          <Button
            label="Continue to Review"
            onPress={handleContinue}
            variant="filled"
            fullWidth
          />
        </View>

        {/* Live preview card */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Credential Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewAccent} />
            <View style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <View>
                  <Text style={styles.previewOfficialLabel}>OFFICIAL DOCUMENT</Text>
                  <Text style={styles.previewInstitution}>{form.institution || 'Institution'}</Text>
                </View>
                <View style={styles.previewSeal}>
                  <Text style={styles.previewSealIcon}>⚖</Text>
                </View>
              </View>
              <Text style={styles.previewDegree}>{form.degree || 'Degree Title Here'}</Text>
              <Text style={styles.previewAwardedTo}>awarded to</Text>
              <Text style={styles.previewName}>{form.studentName || 'Student Name'}</Text>
              <View style={styles.previewFooter}>
                <View>
                  <Text style={styles.previewFooterLabel}>Date Issued</Text>
                  <Text style={styles.previewFooterValue}>{form.issueDate || 'YYYY-MM-DD'}</Text>
                </View>
                <View>
                  <Text style={styles.previewFooterLabel}>Grade</Text>
                  <Text style={styles.previewFooterValue}>{form.grade || '-'}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.previewNote}>
            <Text style={styles.previewNoteIcon}>ℹ️</Text>
            <Text style={styles.previewNoteText}>
              Preview updates as you type. This credential will be minted as a verifiable record.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  lockIcon: { fontSize: 48, marginBottom: Spacing.sm },
  lockTitle: { ...Typography.headlineLgMobile, color: Colors.onSurface, textAlign: 'center' },
  lockDesc: { ...Typography.bodyLg, color: Colors.onSurfaceVariant, textAlign: 'center', maxWidth: 300 },
  pageHeader: { marginBottom: Spacing.lg },
  pageTitle: { ...Typography.headlineLgMobile, color: Colors.onSurface, marginBottom: Spacing.xs },
  pageSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    marginBottom: Spacing.lg,
    ...Shadow.level1,
  },
  sectionTitle: {
    ...Typography.titleLg,
    color: Colors.primary,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    fontSize: 16,
  },
  previewSection: {},
  previewTitle: { ...Typography.titleLg, color: Colors.onSurface, marginBottom: Spacing.md, fontSize: 16 },
  previewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    marginBottom: Spacing.sm,
    ...Shadow.level1,
    height: 320,
    flexDirection: 'row',
  },
  previewAccent: { width: 4, backgroundColor: Colors.tertiary },
  previewContent: { flex: 1, padding: Spacing.lg, justifyContent: 'space-between' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  previewOfficialLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant, letterSpacing: 1.5, marginBottom: Spacing.xs },
  previewInstitution: { ...Typography.titleLg, color: Colors.primary, fontSize: 14 },
  previewSeal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.tertiary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSealIcon: { fontSize: 18, color: Colors.tertiary },
  previewDegree: { ...Typography.headlineLgMobile, color: Colors.onSurface, fontSize: 20 },
  previewAwardedTo: { ...Typography.bodyLg, color: Colors.onSurfaceVariant },
  previewName: { ...Typography.titleLg, color: Colors.primary },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
    paddingTop: Spacing.sm,
  },
  previewFooterLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant, marginBottom: 2 },
  previewFooterValue: { ...Typography.bodyMd, color: Colors.onSurface, fontWeight: '500' },
  previewNote: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  previewNoteIcon: { fontSize: 16 },
  previewNoteText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, flex: 1, fontSize: 12 },
});
