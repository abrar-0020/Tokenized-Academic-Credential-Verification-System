import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/config/theme';

export default function ScanQR() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Ionicons name="camera" size={48} color={Colors.outline} style={{ marginBottom: Spacing.md }} />
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.subtitle}>We need access to your camera to scan credential QR codes.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtnText} onPress={() => router.back()}>
          <Text style={styles.backLabel}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    let extractedId = '';

    // Parse URL formats:
    // 1: credentialvault://verify/42
    // 2: https://www.deoxys.in/public-verify?tokenId=42
    // 3: 42 (plain text)

    try {
      if (data.includes('tokenId=')) {
        const url = new URL(data);
        extractedId = url.searchParams.get('tokenId') || '';
      } else if (data.startsWith('credentialvault://verify/')) {
        extractedId = data.split('/').pop() || '';
      } else {
        extractedId = data.trim();
      }
    } catch (e) {
      extractedId = data.trim();
    }

    if (extractedId && !isNaN(Number(extractedId))) {
      router.replace({ pathname: '/verifying', params: { tokenId: extractedId } });
    } else {
      // Invalid QR, wait a bit and allow scanning again
      setTimeout(() => setScanned(false), 2000);
    }
  };

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { marginTop: insets.top }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.overlayText, { marginTop: insets.top + 8 }]}>
            Scan Credential QR
          </Text>
        </View>

        <View style={styles.scannerBox}>
          {/* Target corners */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'black' },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  btn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  btnText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
  backBtnText: { padding: Spacing.md },
  backLabel: { ...Typography.labelLg, color: Colors.outline },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    ...Typography.titleLg,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginRight: 44, // Offset backBtn for center alignment
  },
  scannerBox: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primaryFixed,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
});
