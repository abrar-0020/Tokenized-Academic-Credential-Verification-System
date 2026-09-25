import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/M3/Button';
import { useWallet } from '@/context/WalletContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/config/theme';

const { width } = Dimensions.get('window');

export default function AppEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo + Hero */}
      <View style={styles.hero}>
                <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <View style={[styles.logoCircle, { backgroundColor: 'transparent', overflow: 'hidden' }]}>
            <Image 
              source={require('../assets/new-icon.png')} 
              style={{ width: 88, height: 88, borderRadius: 20 }} 
              resizeMode="cover"
            />
          </View>
        </Animated.View>
        <Text style={styles.appName}>TokCred</Text>
        <Text style={styles.tagline}>Verified academic credentials{'\n'}on the blockchain</Text>
      </View>

      {/* Trust indicators */}
      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Ionicons name="lock-closed" size={22} color={Colors.primary} />
          <Text style={styles.trustLabel}>Immutable</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="flash" size={22} color={Colors.primary} />
          <Text style={styles.trustLabel}>Instant</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="globe" size={22} color={Colors.primary} />
          <Text style={styles.trustLabel}>Decentralized</Text>
        </View>
      </View>

      {/* Three experience CTAs */}
      <View style={styles.ctas}>
        {/* Student CTA */}
        <TouchableOpacity
          style={[styles.ctaCard, styles.ctaCardPrimary]}
          onPress={() => router.push('/wallet-connect?type=student')}
          activeOpacity={0.85}
        >
          <View style={[styles.ctaIconBox, { backgroundColor: Colors.primaryContainer + '20' }]}>
            <Ionicons name="school" size={24} color={Colors.primary} />
          </View>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Student Portal</Text>
            <Text style={styles.ctaDesc}>View and manage your credentials</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.outline} />
        </TouchableOpacity>

        {/* Verifier CTA */}
        <TouchableOpacity
          style={[styles.ctaCard, styles.ctaCardSecondary]}
          onPress={() => router.push('/verify')}
          activeOpacity={0.85}
        >
          <View style={[styles.ctaIconBox, { backgroundColor: Colors.secondaryContainer + '40' }]}>
            <Ionicons name="search" size={24} color={Colors.secondary} />
          </View>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Verify a Credential</Text>
            <Text style={styles.ctaDesc}>No wallet required · Instant result</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.outline} />
        </TouchableOpacity>

        {/* Issuer CTA */}
        <TouchableOpacity
          style={[styles.ctaCard, styles.ctaCardTertiary]}
          onPress={() => router.push('/wallet-connect?type=issuer')}
          activeOpacity={0.85}
        >
          <View style={[styles.ctaIconBox, { backgroundColor: Colors.tertiaryContainer + '20' }]}>
            <Ionicons name="business" size={24} color={Colors.tertiary} />
          </View>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Institution Console</Text>
            <Text style={styles.ctaDesc}>Issue credentials · Requires wallet</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.outline} />
        </TouchableOpacity>
      </View>

      {/* Tagline footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footer}>
          Secured by Ethereum · Decentralized · Tamper-proof
        </Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => router.push('/about')}>
            <Text style={styles.footerLink}>About</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}>·</Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}>·</Text>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.level2,
  },
  appName: {
    ...Typography.headlineLg,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 26,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  trustItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trustLabel: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  ctas: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    ...Shadow.level1,
  },
  ctaCardPrimary: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.primary + '40',
  },
  ctaCardSecondary: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant + '40',
  },
  ctaCardTertiary: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant + '40',
  },
  ctaIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    ...Typography.titleLg,
    color: Colors.onSurface,
    fontSize: 16,
  },
  ctaDesc: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  footerContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  footer: {
    ...Typography.labelMd,
    color: Colors.outline,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  footerLink: {
    ...Typography.labelMd,
    color: Colors.primary,
  },
  footerDot: {
    ...Typography.labelMd,
    color: Colors.outline,
  },
});
