import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '@/context/WalletContext';
import { uploadToIPFS } from '@/services/ipfs/metadata';
import { issueCredentialTx } from '@/services/blockchain/credentials';
import { Colors, Typography, Spacing } from '@/config/theme';

type TxStep = 'preparing' | 'waiting_wallet' | 'submitted' | 'confirming' | 'done' | 'error';

const STEP_MESSAGES: Record<TxStep, string> = {
  preparing: 'Preparing transaction…',
  waiting_wallet: 'Waiting for wallet approval…',
  submitted: 'Transaction submitted to network…',
  confirming: 'Confirming on blockchain…',
  done: 'Credential issued successfully!',
  error: 'Transaction failed.',
};

export default function TransactionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signer } = useWallet();
  const params = useLocalSearchParams<{
    walletAddress: string;
    studentName: string;
    degree: string;
    institution: string;
    grade: string;
    issueDate: string;
  }>();

  const [step, setStep] = useState<TxStep>('preparing');
  const [tokenId, setTokenId] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!signer) {
        setStep('error');
        setError('Wallet signer not available. Please reconnect.');
        return;
      }

      try {
        // 1. Prepare metadata
        setStep('preparing');
        const metadata = {
          name: params.degree,
          description: `${params.degree} awarded by ${params.institution}`,
          studentName: params.studentName,
          degree: params.degree,
          institution: params.institution,
          grade: params.grade,
          issueDate: params.issueDate,
        };
        const metadataURI = await uploadToIPFS(metadata);

        // 2. Waiting for wallet to approve
        setStep('waiting_wallet');
        const { tx, tokenId: id } = await issueCredentialTx(signer, params.walletAddress, metadataURI);

        // 3. Submitted
        setStep('submitted');
        setTxHash(tx.hash);

        // 4. Confirming
        setStep('confirming');
        await tx.wait(1);

        // 5. Done
        setTokenId(id);
        setStep('done');

        // Navigate to success after short delay
        setTimeout(() => {
          router.replace({ pathname: '/success', params: { tokenId: id, txHash: tx.hash } });
        }, 1000);
      } catch (err: any) {
        setStep('error');
        setError(err.message ?? 'An unexpected error occurred.');
      }
    };

    run();
  }, []);

  const isError = step === 'error';
  const isDone = step === 'done';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {isError ? (
        <Text style={styles.errorIcon}>❌</Text>
      ) : isDone ? (
        <Text style={styles.doneIcon}>✅</Text>
      ) : (
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
      )}

      <Text style={styles.title}>{STEP_MESSAGES[step]}</Text>

      {!isError && !isDone && (
        <View style={styles.steps}>
          {STEPS_ORDER.map((s, i) => (
            <View key={i} style={styles.step}>
              <View
                style={[
                  styles.stepDot,
                  STEPS_ORDER.indexOf(step) > i && styles.stepDotDone,
                  STEPS_ORDER.indexOf(step) === i && styles.stepDotActive,
                ]}
              />
              <Text
                style={[
                  styles.stepText,
                  STEPS_ORDER.indexOf(step) === i && styles.stepTextActive,
                ]}
              >
                {STEP_MESSAGES[s]}
              </Text>
            </View>
          ))}
        </View>
      )}

      {isError && (
        <>
          <Text style={styles.errorMsg}>{error}</Text>
          <Text style={styles.errorAction} onPress={() => router.back()}>
            ← Go back and retry
          </Text>
        </>
      )}

      <Text style={styles.note}>Do not close the app while the transaction is pending.</Text>
    </View>
  );
}

const STEPS_ORDER: TxStep[] = ['preparing', 'waiting_wallet', 'submitted', 'confirming'];

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorIcon: { fontSize: 56, marginBottom: Spacing.lg },
  doneIcon: { fontSize: 56, marginBottom: Spacing.lg },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  steps: { width: '100%', maxWidth: 320, gap: Spacing.md, marginBottom: Spacing.xl },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.outlineVariant,
  },
  stepDotDone: { backgroundColor: Colors.secondaryContainer },
  stepDotActive: { backgroundColor: Colors.primaryContainer },
  stepText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  stepTextActive: { color: Colors.primaryContainer, fontWeight: '600' },
  note: { ...Typography.labelMd, color: Colors.outline, textAlign: 'center', letterSpacing: 0.5 },
  errorMsg: {
    ...Typography.bodyLg,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 300,
  },
  errorAction: {
    ...Typography.labelLg,
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
});
