import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Shadow } from '@/config/theme';

type Props = {
  title?: string;
  showBack?: boolean;
  trailing?: React.ReactNode;
};

export default function TopAppBar({ title = 'CredentialVault', showBack = false, trailing }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Leading */}
      <View style={styles.leading}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={styles.icon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>⚖</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Trailing */}
      <View style={styles.trailing}>{trailing ?? <View style={{ width: 40 }} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    ...Shadow.level1,
    zIndex: 40,
  },
  leading: {
    width: 44,
    alignItems: 'flex-start',
  },
  trailing: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh + '80',
  },
  icon: {
    fontSize: 20,
    color: Colors.primary,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    fontSize: 22,
    color: Colors.primaryContainer,
  },
});
