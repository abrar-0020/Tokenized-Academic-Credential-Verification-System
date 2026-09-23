import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '@/components/M3/TopAppBar';
import { verifyCredential } from '@/services/verification/verifyCredential';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';

export default function Verifying() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokenId } = useLocalSearchParams<{ tokenId: string }>();

  // Pulse animation for skeleton
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const result = await verifyCredential(tokenId);
        if (result.credential.revoked) {
          router.replace({ pathname: '/failed', params: { reason: 'revoked', tokenId } });
        } else {
          router.replace({
            pathname: '/verified',
            params: {
              tokenId,
              studentName: result.metadata?.studentName || 'Unknown',
              degree: result.metadata?.degree || result.metadata?.name || 'Academic Credential',
              institution: result.metadata?.institution || 'Unknown Institution',
              grade: result.metadata?.grade || '',
              issueDate: result.metadata?.issueDate || '',
            },
          });
        }
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase();
        let reason = 'not_found';
        
        if (
          msg.includes('network') || 
          msg.includes('fetch') || 
          msg.includes('offline') || 
          msg.includes('timeout') ||
          msg.includes('host') ||
          msg.includes('internet')
        ) {
          reason = 'network';
        }
        
        router.replace({ pathname: '/failed', params: { reason, tokenId } });
      }
    };
    if (tokenId) run();
  }, [tokenId]);

  return (
    <View style={styles.screen}>
      <TopAppBar title="Verifying..." showBack />
      
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Animated.View style={[styles.skeletonContainer, { opacity: pulseAnim }]}>
          
          {/* Skeleton Card matching verified.tsx layout */}
          <View style={styles.card}>
            {/* Top Accent */}
            <View style={styles.topAccent} />

            <View style={styles.cardContent}>
              {/* Checkmark hero placeholder */}
              <View style={styles.skeletonHeroCircle} />
              <View style={styles.skeletonTitle} />
              
              <View style={styles.spacingLg} />

              {/* Degree & Institution */}
              <View style={styles.skeletonH1} />
              <View style={styles.skeletonH2} />

              <View style={styles.spacingXl} />

              {/* Detail Rows */}
              <View style={styles.detailRow}>
                <View style={styles.skeletonLabel} />
                <View style={styles.skeletonValue} />
              </View>
              <View style={styles.detailRow}>
                <View style={styles.skeletonLabel} />
                <View style={styles.skeletonValueShort} />
              </View>
              <View style={styles.detailRow}>
                <View style={styles.skeletonLabel} />
                <View style={styles.skeletonValueShort} />
              </View>

              <View style={styles.spacingXl} />

              {/* Ledger Proof Button placeholder */}
              <View style={styles.skeletonButton} />
            </View>
          </View>

        </Animated.View>
      </View>
    </View>
  );
}

const skeletonBase = {
  backgroundColor: Colors.surfaceDim,
  borderRadius: Radius.sm,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  skeletonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
    overflow: 'hidden',
    ...Shadow.level2,
  },
  topAccent: {
    height: 6,
    backgroundColor: Colors.surfaceDim,
  },
  cardContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  
  // Placeholders
  skeletonHeroCircle: {
    ...skeletonBase,
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: Spacing.md,
  },
  skeletonTitle: {
    ...skeletonBase,
    width: 200,
    height: 24,
    borderRadius: Radius.full,
  },
  
  skeletonH1: {
    ...skeletonBase,
    width: '90%',
    height: 32,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  skeletonH2: {
    ...skeletonBase,
    width: '60%',
    height: 20,
    borderRadius: Radius.full,
  },

  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '15',
  },
  skeletonLabel: {
    ...skeletonBase,
    width: 100,
    height: 16,
    borderRadius: Radius.full,
  },
  skeletonValue: {
    ...skeletonBase,
    width: 140,
    height: 16,
    borderRadius: Radius.full,
  },
  skeletonValueShort: {
    ...skeletonBase,
    width: 80,
    height: 16,
    borderRadius: Radius.full,
  },

  skeletonButton: {
    ...skeletonBase,
    width: '100%',
    height: 48,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },

  spacingLg: { height: Spacing.lg },
  spacingXl: { height: Spacing.xl },
});
