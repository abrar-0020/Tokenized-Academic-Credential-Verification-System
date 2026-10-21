import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { AppBackdrop } from '@/components/glass/AppBackdrop';
import { GlassSurface as CurrentGlassSurface } from '@/components/glass/GlassSurface';
import { FixedGlassSurface } from '@/components/glass/FixedGlassSurface';
import { NoBlurGlassSurface } from '@/components/glass/NoBlurGlassSurface';
import { TokCredIcon } from '@/components/TokCredIcons';

export default function GlassTestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <AppBackdrop />
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <TokCredIcon name="back" size={22} color="#F2F4F8" />
          </TouchableOpacity>
          <Text style={styles.title}>Glass Restyle Test</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>
          Compare the three glass rendering methods over the animated background glow orbs:
        </Text>

        {/* ================= OPTION A ================= */}
        <View style={styles.section}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>OPTION A</Text>
            <Text style={styles.badgeDesc}>Current GlassSurface (tint="dark", android fallback slab)</Text>
          </View>
          <CurrentGlassSurface borderRadius={24}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <TokCredIcon name="qr" size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Scan QR Code</Text>
            </View>
            <Text style={styles.cardText}>
              Current code: has dark tint blur and fallback overlay. Notice the square corners and grey opacity.
            </Text>
            <TouchableOpacity style={styles.flatPrimaryBtn} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Flat Primary Button</Text>
            </TouchableOpacity>
          </CurrentGlassSurface>
        </View>

        {/* ================= OPTION B ================= */}
        <View style={styles.section}>
          <View style={styles.badgeRow}>
            <Text style={[styles.badgeText, { backgroundColor: '#3B8CFF' }]}>OPTION B (Recommended)</Text>
            <Text style={styles.badgeDesc}>Fixed Layered Glass (tint="default", inner clip, rim highlight)</Text>
          </View>
          <FixedGlassSurface borderRadius={24}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 140, 255, 0.22)' }]}>
                <TokCredIcon name="qr" size={24} color="#7DB4FF" />
              </View>
              <Text style={styles.cardTitle}>Scan QR Code</Text>
            </View>
            <Text style={styles.cardText}>
              Fixed 4-layer order: outer shadow View, inner clipped BlurView with default/neutral tint, 145° gradient fill, lit top rim, and lit 1px border.
            </Text>
            {/* Glossy Primary Button */}
            <TouchableOpacity activeOpacity={0.85} style={styles.glossyBtnContainer}>
              <LinearGradient
                colors={['#3F96FF', '#1677FF', '#0F68EE']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* 1px inset top highlight (white 45%) */}
              <View style={styles.btnTopHighlight} />
              {/* Bottom shade (black 12%) */}
              <View style={styles.btnBottomShade} />
              <Text style={styles.primaryBtnText}>Glossy Primary Button</Text>
            </TouchableOpacity>
          </FixedGlassSurface>
        </View>

        {/* ================= OPTION C ================= */}
        <View style={styles.section}>
          <View style={styles.badgeRow}>
            <Text style={[styles.badgeText, { backgroundColor: '#8B5CF6' }]}>OPTION C</Text>
            <Text style={styles.badgeDesc}>No Live Blur (Translucent gradient fill + lit rim + lit border)</Text>
          </View>
          <NoBlurGlassSurface borderRadius={24}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.22)' }]}>
                <TokCredIcon name="shield" size={24} color="#C4B5FD" />
              </View>
              <Text style={styles.cardTitle}>Verify Credential</Text>
            </View>
            <Text style={styles.cardText}>
              Zero blur artifacts on Android: pure translucent specular gradient fill, glowing top rim, and subtle lit border. 100% smooth and backdrop colors show through cleanly.
            </Text>
            {/* Secondary Glass Action Button */}
            <View style={styles.secondaryGlassBtn}>
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.btnTopHighlight} />
              <Text style={[styles.primaryBtnText, { color: '#F2F4F8' }]}>
                Secondary Glass Action
              </Text>
            </View>
          </NoBlurGlassSurface>
        </View>

        {/* ================= TAB BAR COMPARISONS ================= */}
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
            Floating Nav Bar Pill (Fixed Glass)
          </Text>
          <View style={styles.previewNavContainer}>
            {/* Outer shadow container */}
            <View style={styles.previewNavOuter}>
              {/* Clip view */}
              <View style={[StyleSheet.absoluteFill, { borderRadius: 30, overflow: 'hidden' }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.17)', 'rgba(255,255,255,0.06)']}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {/* Top specular rim */}
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.40)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.navTopRim}
                />
              </View>
              {/* Border */}
              <View style={styles.navBorder} pointerEvents="none" />

              <View style={styles.previewNavInner}>
                <View style={styles.previewTabItem}>
                  <TokCredIcon name="home" size={20} color="#8A93A3" />
                  <Text style={styles.previewTabLabel}>Home</Text>
                </View>
                <View style={styles.previewTabItem}>
                  <TokCredIcon name="qr" size={20} color="#8A93A3" />
                  <Text style={styles.previewTabLabel}>Scan</Text>
                </View>
                {/* Active Tab: Blue-tinted glass pill */}
                <View style={[styles.previewTabItem, styles.previewActiveTab]}>
                  <LinearGradient
                    colors={['rgba(59,140,255,0.30)', 'rgba(59,140,255,0.18)']}
                    style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                  />
                  <View style={styles.activeTabTopRim} />
                  <TokCredIcon name="shield" size={20} color="#7DB4FF" />
                  <Text style={[styles.previewTabLabel, { color: '#7DB4FF', fontWeight: '600' }]}>
                    Verify
                  </Text>
                </View>
                <View style={styles.previewTabItem}>
                  <TokCredIcon name="user" size={20} color="#8A93A3" />
                  <Text style={styles.previewTabLabel}>Profile</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090B10',
  },
  content: {
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F2F4F8',
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA3B2',
    lineHeight: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F2F4F8',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#475569',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1677FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F2F4F8',
  },
  cardText: {
    fontSize: 13,
    color: '#9AA3B2',
    lineHeight: 19,
    marginBottom: 16,
  },
  flatPrimaryBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1677FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glossyBtnContainer: {
    height: 52,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  btnTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  btnBottomShade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryGlassBtn: {
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewNavContainer: {
    marginTop: 4,
  },
  previewNavOuter: {
    borderRadius: 30,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 10,
  },
  navBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  navTopRim: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
  },
  previewNavInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  previewTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
    borderRadius: 24,
  },
  previewActiveTab: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    overflow: 'hidden',
  },
  activeTabTopRim: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  previewTabLabel: {
    fontSize: 10,
    color: '#8A93A3',
    fontWeight: '500',
  },
});
