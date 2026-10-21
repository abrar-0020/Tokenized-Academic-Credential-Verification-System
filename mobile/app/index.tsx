import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Share,
  Linking,
  Dimensions,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LightColors, DarkColors, Shadows } from '@/config/tokens';
import { TokCredIcon } from '@/components/TokCredIcons';
import { QrSvg } from '@/components/QrSvg';
import { AppBackdrop } from '@/components/glass/AppBackdrop';

// Real Blockchain & IPFS Services
import { getPublicContract } from '@/services/blockchain/provider';
import { getStudentCredentialIds, getCredentialDetails } from '@/services/blockchain/credentials';
import { fetchMetadata } from '@/services/ipfs/metadata';
import { CONTRACT_ADDRESS, PUBLIC_RPC_URL } from '@/config/contract';
import { useWallet } from '@/context/WalletContext';
import { shortenAddress } from '@/utils/helpers';
import { saveCertificatePdf } from '@/services/certificate/generator';

const extractStudentName = (meta: any, studentAddress?: string): string => {
  if (!meta) return studentAddress ? shortenAddress(studentAddress) : 'Student';
  const nameFromField =
    meta.studentName ||
    meta.student_name ||
    meta.student ||
    meta.recipient ||
    meta.recipientName ||
    (meta.name && meta.name.includes(' - ') ? meta.name.split(' - ')[1]?.trim() : undefined) ||
    meta.attributes?.find?.((a: any) =>
      a.trait_type?.toLowerCase()?.includes('student') ||
      a.trait_type?.toLowerCase()?.includes('recipient')
    )?.value;

  if (nameFromField && typeof nameFromField === 'string' && nameFromField.trim()) {
    return nameFromField.trim();
  }
  return studentAddress ? shortenAddress(studentAddress) : 'Student';
};

type ScreenType =
  | 'role'
  | 'home'
  | 'creds'
  | 'detail'
  | 'qr'
  | 'vhome'
  | 'manual'
  | 'scan'
  | 'load'
  | 'ok'
  | 'no'
  | 'profile'
  | 'about'
  | 'privacy'
  | 'terms';

export interface DisplayCredential {
  tokenId: string;
  degree: string;
  program: string;
  institution: string;
  monogram: string;
  year: string;
  studentName: string;
  grade: string;
  status: string;
  metadataURI: string;
  explorerUrl: string;
  revoked: boolean;
}

export default function TokCredApp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, connectWallet, disconnectWallet } = useWallet();

  const [role, setRole] = useState<'student' | 'verifier'>('student');
  const [scr, setScr] = useState<ScreenType>('role');
  const [hist, setHist] = useState<ScreenType[]>([]);
  const [cur, setCur] = useState<number>(0);
  const [q, setQ] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [res, setRes] = useState<'ok' | 'no'>('ok');
  const [st, setSt] = useState<string>(''); // '', 'ok', 'er'
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Appearance & Notification States (Permanent Dark Liquid Glass)
  const theme = 'dark';
  const [notifModalVisible, setNotifModalVisible] = useState<boolean>(false);
  const [notifIssuance, setNotifIssuance] = useState<boolean>(true);
  const [notifVerify, setNotifVerify] = useState<boolean>(true);
  const [notifNetwork, setNotifNetwork] = useState<boolean>(false);

  // Dynamic Theme Colors and Styles
  const Colors = DarkColors;
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  // Real data state
  const [credentials, setCredentials] = useState<DisplayCredential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState<boolean>(false);
  const [verifiedRecord, setVerifiedRecord] = useState<DisplayCredential | null>(null);

  // Loading steps
  const [loadStep1, setLoadStep1] = useState<boolean>(false);
  const [loadStep2, setLoadStep2] = useState<boolean>(false);
  const [loadStep3, setLoadStep3] = useState<boolean>(false);

  // Real Camera & Scanner state
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState<boolean>(false);

  // Animated references & exit debounce
  const screenFade = useRef(new Animated.Value(1)).current;
  const screenTranslate = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.6)).current;
  const scanLaser = useRef(new Animated.Value(16)).current;
  const lastBackPressRef = useRef<number>(0);

  // Hardware Back Button Handler (prevents app from closing unexpectedly)
  useEffect(() => {
    const onBackPress = () => {
      // 1. If currently on role selection, require double tap to exit
      if (scr === 'role') {
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          return false; // Exit app
        }
        lastBackPressRef.current = now;
        toast('Press back again to exit');
        return true;
      }

      // 2. If there is screen history to pop, pop it
      if (hist.length > 0) {
        const prev = hist[hist.length - 1];
        setHist((h) => h.slice(0, h.length - 1));
        if (prev === 'scan') setHasScanned(false);
        setScr(prev);
        return true;
      }

      // 3. If on a sub-screen or non-home tab, go back to role home
      const homeScr = role === 'student' ? 'home' : 'vhome';
      if (scr !== homeScr) {
        setScr(homeScr);
        return true;
      }

      // 4. At root home screen: double-press debounce to prevent accidental exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        return false; // Exit app
      }
      lastBackPressRef.current = now;
      toast('Press back again to exit');
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [scr, hist, role]);

  // Initialize role and theme from localStorage
  useEffect(() => {
    (async () => {
      try {
        const savedRole = await AsyncStorage.getItem('tc-role');
        if (savedRole === 'student' || savedRole === 'verifier') {
          setRole(savedRole);
          setScr(savedRole === 'student' ? 'home' : 'vhome');
        } else {
          setScr('role');
        }

        // Preserve tc-theme key in storage while enforcing dark liquid-glass
        await AsyncStorage.getItem('tc-theme');
      } catch (e) {
        setScr('role');
      }
    })();
  }, []);

  // Fetch real on-chain credentials
  const loadBlockchainCredentials = useCallback(async () => {
    // If student has not connected their wallet, do NOT load any credentials
    if (!account) {
      setCredentials([]);
      setLoadingCreds(false);
      return;
    }

    setLoadingCreds(true);
    try {
      const contract = getPublicContract();
      const tokenIds: bigint[] = await getStudentCredentialIds(account);

      const loaded: DisplayCredential[] = [];
      for (const tId of tokenIds) {
        try {
          const onChain = await contract.getCredentialDetails(tId);
          let degree = 'Academic Credential';
          let program = 'General Studies';
          let institution = 'Issuing University';
          let studentName = shortenAddress(onChain.student) || (account ? shortenAddress(account) : 'Student');
          let grade = 'Passed';
          let year = '2024';

          try {
            const meta = await fetchMetadata(onChain.metadataURI);
            degree = meta.degree || meta.name || degree;
            institution = meta.institution || institution;
            studentName = extractStudentName(meta, onChain.student);
            grade = meta.grade || grade;
            year = meta.issueDate ? new Date(meta.issueDate).getFullYear().toString() : '2024';
            program = (meta as any).program || (meta as any).major || degree;
          } catch {}

          const words = institution.split(' ');
          const monogram = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : institution.slice(0, 2).toUpperCase();

          loaded.push({
            tokenId: tId.toString(),
            degree,
            program,
            institution,
            monogram: monogram || 'TC',
            year,
            studentName,
            grade,
            status: onChain.revoked ? 'Revoked' : 'Verified',
            metadataURI: onChain.metadataURI,
            explorerUrl: `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`,
            revoked: onChain.revoked,
          });
        } catch (e) {}
      }

      setCredentials(loaded);
    } catch (err) {
      console.warn('Blockchain load error:', err);
    } finally {
      setLoadingCreds(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      loadBlockchainCredentials();
    } else {
      setCredentials([]);
    }
  }, [account, loadBlockchainCredentials]);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 1800);
  };

  const go = (nextScr: ScreenType, back = false) => {
    if (nextScr === 'scan') {
      setHasScanned(false);
    }
    setHist((prev) => [...prev, scr]);
    setScr(nextScr);
    screenTranslate.setValue(0);
  };

  const goBack = () => {
    if (hist.length > 0) {
      const prev = hist[hist.length - 1];
      setHist((h) => h.slice(0, h.length - 1));
      if (prev === 'scan') setHasScanned(false);
      setScr(prev);
    } else {
      setScr(role === 'student' ? 'home' : 'vhome');
    }
  };

  // QR Barcode Scanner callback
  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (hasScanned) return;
      setHasScanned(true);

      let cleanData = (data || '').trim();
      let tokenId = null;

      // Handle unissued draft or sample preview QRs
      if (cleanData.includes('draft=true') || cleanData.includes('status=draft') || cleanData.includes('sample=true')) {
        toast('Draft preview certificate — not yet issued on-chain');
        setTimeout(() => setHasScanned(false), 2500);
        return;
      }

      if (cleanData.includes('tokenId=')) {
        const match = cleanData.match(/tokenId=([0-9]+)/);
        if (match) tokenId = match[1];
      } else if (cleanData.startsWith('tokcred://verify/')) {
        const parts = cleanData.split('/');
        const last = parts[parts.length - 1];
        if (/^[0-9]+$/.test(last)) tokenId = last;
      } else if (/^[0-9]+$/.test(cleanData)) {
        tokenId = cleanData;
      } else if (cleanData.includes('/')) {
        const parts = cleanData.split('/');
        const last = parts[parts.length - 1];
        const match = last.match(/[0-9]+/);
        if (match) tokenId = match[0];
      }

      if (!tokenId) {
        toast('No issued Token ID found in QR code');
        setTimeout(() => setHasScanned(false), 2500);
        return;
      }

      toast(`Scanned Token #${tokenId}`);
      verifyTokenOnChain(tokenId);
    },
    [hasScanned]
  );

  // Real verification function
  const verifyTokenOnChain = async (inputCode: string) => {
    let cleanId = inputCode.trim();
    if (cleanId.includes('/')) {
      const parts = cleanId.split('/');
      cleanId = parts[parts.length - 1];
    }
    const numericMatch = cleanId.match(/\d+/);
    if (!numericMatch) {
      toast('Invalid Token ID format');
      setScr('no');
      return;
    }
    const tokenIdToFetch = numericMatch[0];

    setHist((prev) => [...prev, scr]);
    setScr('load');
    setLoadStep1(false);
    setLoadStep2(false);
    setLoadStep3(false);

    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim1, {
          toValue: 1.1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity1, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => setLoadStep1(true), 450);
    setTimeout(() => setLoadStep2(true), 900);
    setTimeout(() => setLoadStep3(true), 1350);

    try {
      const contract = getPublicContract();
      const onChain = await contract.getCredentialDetails(BigInt(tokenIdToFetch));

      if (onChain.student === '0x0000000000000000000000000000000000000000' || onChain.revoked) {
        setTimeout(() => setScr('no'), 1900);
        return;
      }

      let degree = 'Academic Credential';
      let program = 'Computer Science & Engineering';
      let institution = 'Verified University';
      let studentName = shortenAddress(onChain.student) || 'Student';
      let grade = 'A';
      let year = '2024';

      try {
        const meta = await fetchMetadata(onChain.metadataURI);
        degree = meta.degree || meta.name || degree;
        institution = meta.institution || institution;
        studentName = extractStudentName(meta, onChain.student);
        grade = meta.grade || grade;
        year = meta.issueDate ? new Date(meta.issueDate).getFullYear().toString() : '2024';
        program = (meta as any).program || (meta as any).major || degree;
      } catch {}

      const words = institution.split(' ');
      const monogram = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : institution.slice(0, 2).toUpperCase();

      const record: DisplayCredential = {
        tokenId: tokenIdToFetch,
        degree,
        program,
        institution,
        monogram: monogram || 'TC',
        year,
        studentName,
        grade,
        status: onChain.revoked ? 'Revoked' : 'Verified',
        metadataURI: onChain.metadataURI,
        explorerUrl: `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`,
        revoked: onChain.revoked,
      };

      setVerifiedRecord(record);
      setTimeout(() => setScr('ok'), 1900);
    } catch (err) {
      setTimeout(() => setScr('no'), 1900);
    }
  };

  useEffect(() => {
    if (scr === 'scan') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLaser, {
            toValue: 232,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(scanLaser, {
            toValue: 16,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [scr]);

  const shareV = async () => {
    const c = verifiedRecord || credentials[cur];
    if (!c) return;
    const tx = `TokCred Credential Verification\n\nCredential:\n${c.degree}\n\nStudent:\n${c.studentName}\n\nInstitution:\n${c.institution}\n\nGrade:\n${c.grade}\n\nStatus:\n${c.status}\n\nToken ID:\n#${c.tokenId}\n\nVerification:\nAuthentic`;
    try {
      await Share.share({ title: 'TokCred Credential Verification', message: tx });
    } catch (e) {
      await Clipboard.setStringAsync(tx);
      toast('Verification copied');
    }
  };

  const copyCode = async () => {
    const c = credentials[cur] || verifiedRecord;
    if (c) {
      await Clipboard.setStringAsync(c.tokenId);
      toast(`Token ID #${c.tokenId} copied`);
    }
  };

  const pickRole = async (r: 'student' | 'verifier') => {
    setRole(r);
    await AsyncStorage.setItem('tc-role', r);
    setHist([]);
    setScr(r === 'student' ? 'home' : 'vhome');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('tc-role');
      if (account) {
        await disconnectWallet();
      }
    } catch (e) {}
    setHist([]);
    setScr('role');
    toast('Logged out');
  };

  const isStudent = role === 'student';
  const showNav = ['home', 'creds', 'vhome', 'manual', 'profile'].includes(scr);

  const tabsList = isStudent
    ? [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'creds', label: 'Credentials', icon: 'cards' },
        { id: 'vhome', label: 'Verify', icon: 'shield' },
        { id: 'profile', label: 'Profile', icon: 'user' },
      ]
    : [
        { id: 'vhome', label: 'Home', icon: 'home' },
        { id: 'scan', label: 'Scan', icon: 'qr' },
        { id: 'manual', label: 'Verify', icon: 'shield' },
        { id: 'profile', label: 'Profile', icon: 'user' },
      ];

  const currentTabOn = (() => {
    if (scr === 'home') return 'home';
    if (scr === 'creds') return 'creds';
    if (scr === 'vhome') return isStudent ? 'vhome' : 'home';
    if (scr === 'manual') return isStudent ? 'vhome' : 'manual';
    if (scr === 'profile') return 'profile';
    return '';
  })();

  const renderLogo = () => (
    <View style={styles.logo}>
      <View style={styles.lm}>
        <TokCredIcon name="shield" size={17} color="#fff" strokeWidth={2.2} />
      </View>
      <Text style={styles.logoText}>TokCred</Text>
    </View>
  );

  // Option C: Shared glossy gradient & highlight for primary buttons
  const PriGloss = () => (
    <View style={[StyleSheet.absoluteFill, { borderRadius: 15, overflow: 'hidden' }]} pointerEvents="none">
      <LinearGradient
        colors={['#2D78FF', '#1460E6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 10,
          right: 10,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.45)',
        }}
      />
    </View>
  );

  // Option C: Shared translucent wash & highlight for secondary buttons
  const SecGloss = () => (
    <View style={[StyleSheet.absoluteFill, { borderRadius: 15, overflow: 'hidden' }]} pointerEvents="none">
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 10,
          right: 10,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.22)',
        }}
      />
    </View>
  );

  // Option C: Shared 145° specular shimmer & lit edges for glass cards
  const CardGloss = ({ borderRadius = 22 }: { borderRadius?: number }) => (
    <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]} pointerEvents="none">
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.03)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.40)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1.5 }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 20,
          right: 20,
          height: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        }}
      />
    </View>
  );

  const renderTopBar = (title?: string) => (
    <View style={styles.top}>
      <TouchableOpacity style={styles.ib} onPress={goBack} activeOpacity={0.8}>
        <TokCredIcon name="back" size={22} color={Colors.t} />
      </TouchableOpacity>
      <Text style={styles.topTitle}>{title || ''}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderVerifiedBadge = (text = 'Verified') => (
    <View style={styles.vb}>
      <TokCredIcon name="check" size={13} color={Colors.g} strokeWidth={2.4} />
      <Text style={styles.vbText}>{text}</Text>
    </View>
  );

  const renderKV = (a: string, b: string) => (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{a}</Text>
      <Text style={styles.kvVal} numberOfLines={2}>{b}</Text>
    </View>
  );

  const renderCredentialCard = (c: DisplayCredential, i: number) => (
    <TouchableOpacity
      key={c.tokenId}
      style={styles.cc}
      activeOpacity={0.85}
      onPress={() => {
        setCur(i);
        go('detail');
      }}
    >
      <CardGloss borderRadius={18} />
      <View style={styles.mono}>
        <Text style={styles.monoText}>{c.monogram}</Text>
      </View>
      <View style={styles.ccContent}>
        <Text style={styles.ccTitle} numberOfLines={1}>
          {c.degree}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {c.program}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {c.institution} · {c.year}
        </Text>
      </View>
      <View style={styles.ccRight}>
        <TokCredIcon name="chev" size={22} color={Colors.t3} />
        {renderVerifiedBadge(c.status)}
      </View>
    </TouchableOpacity>
  );

  // Screen Rendering
  const renderScreenContent = () => {
    switch (scr) {
      case 'role':
        return (
          <View>
            <View style={styles.top}>
              {renderLogo()}
              <View style={{ width: 38 }} />
            </View>
            <Text style={styles.h1}>Welcome to TokCred</Text>
            <Text style={styles.sub}>Choose how you'll use the app.</Text>

            <View style={[styles.stack, { marginTop: 28, gap: 14 }]}>
              <TouchableOpacity
                style={[styles.card, styles.big]}
                activeOpacity={0.85}
                onPress={() => pickRole('student')}
              >
                <CardGloss borderRadius={22} />
                <View style={[styles.mono, styles.monoLarge]}>
                  <TokCredIcon name="cards" size={24} color="#fff" />
                </View>
                <Text style={[styles.h2, { marginTop: 20 }]}>Student</Text>
                <Text style={styles.sub}>View and share your academic credentials</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, styles.big]}
                activeOpacity={0.85}
                onPress={() => pickRole('verifier')}
              >
                <CardGloss borderRadius={22} />
                <View style={[styles.mono, styles.monoLarge]}>
                  <TokCredIcon name="shield" size={24} color="#fff" />
                </View>
                <Text style={[styles.h2, { marginTop: 20 }]}>Verifier</Text>
                <Text style={styles.sub}>Verify a student's academic credential</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'home': {
        // If student has NOT connected wallet, show strictly the connect prompt - nothing else
        if (!account) {
          return (
            <View>
              <View style={styles.top}>
                {renderLogo()}
                <View style={styles.av}>
                  <Text style={styles.avText}>ST</Text>
                </View>
              </View>
              <Text style={styles.h1}>Student Portal</Text>
              <Text style={styles.sub}>
                Connect your Web3 wallet to access and manage your verified academic credentials.
              </Text>

              {/* Clean, Premium Connect Wallet Card */}
              <View style={[styles.card, { padding: 24, marginTop: 28, alignItems: 'center', borderRadius: 24 }]}>
                <CardGloss borderRadius={24} />
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.bs, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
                  <TokCredIcon name="lock" size={32} color={Colors.b} />
                </View>
                <Text style={[styles.h2, { textAlign: 'center', marginBottom: 8 }]}>
                  Connect Student Wallet
                </Text>
                <Text style={[styles.sub, { textAlign: 'center', marginBottom: 24, marginVertical: 0 }]}>
                  Your academic degrees are stored as soulbound credentials on the Ethereum Sepolia blockchain. Connect your wallet to view them.
                </Text>
                <TouchableOpacity
                  style={[styles.btn, styles.pri]}
                  activeOpacity={0.85}
                  onPress={() => connectWallet()}
                >
                  <PriGloss />
                  <TokCredIcon name="shield" size={18} color="#fff" />
                  <Text style={styles.btnTextPri}>Connect Wallet (MetaMask)</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

        // When wallet IS connected, show their verified credentials
        return (
          <View>
            <View style={styles.top}>
              {renderLogo()}
              <TouchableOpacity
                style={styles.av}
                onPress={() => disconnectWallet()}
              >
                <Text style={styles.avText}>✓</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.h1}>Student Credentials</Text>
            <Text style={styles.sub}>
              Wallet: {account.slice(0, 6)}...{account.slice(-4)} • Sepolia Testnet
            </Text>

            {/* Hero Card */}
            <TouchableOpacity
              style={[styles.card, styles.hero]}
              activeOpacity={0.85}
              onPress={() => go('creds')}
            >
              {/* Specular shimmer overlay */}
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 30 }]}
                pointerEvents="none"
              />
              {/* Top rim highlight */}
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.heroTopRim}
                pointerEvents="none"
              />
              <View style={styles.heroSd}>
                <TokCredIcon name="shield" size={22} color="#fff" />
              </View>
              <Text style={[styles.meta, { fontSize: 15 }]}>Your Verified Credentials</Text>
              <Text style={styles.heroN}>{credentials.length}</Text>
              <Text style={styles.meta}>Soulbound on Sepolia Blockchain</Text>
            </TouchableOpacity>

            {/* My Credentials Section */}
            <View style={styles.sec}>
              <View style={styles.sh}>
                <Text style={styles.h2}>My Credentials</Text>
                {credentials.length > 2 && (
                  <TouchableOpacity onPress={() => go('creds')}>
                    <Text style={styles.linkText}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
              {loadingCreds ? (
                <ActivityIndicator color={Colors.b} style={{ marginVertical: 20 }} />
              ) : credentials.length > 0 ? (
                credentials.slice(0, 2).map((c, i) => renderCredentialCard(c, i))
              ) : (
                <View style={[styles.card, { padding: 20, alignItems: 'center' }]}>
                  <Text style={styles.sub}>No credentials found for this wallet address.</Text>
                </View>
              )}
            </View>

            {/* Quick Actions (only if credentials exist) */}
            {credentials.length > 0 && (
              <View style={styles.sec}>
                <View style={styles.sh}>
                  <Text style={styles.h2}>Quick Actions</Text>
                </View>
                <View style={styles.qa}>
                  <TouchableOpacity
                    style={[styles.card, styles.qaCard]}
                    activeOpacity={0.8}
                    onPress={() => go('creds')}
                  >
                    <CardGloss borderRadius={18} />
                    <View style={styles.qaIc}>
                      <TokCredIcon name="cards" size={22} color={Colors.b} />
                    </View>
                    <Text style={styles.qaText}>View All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.card, styles.qaCard]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCur(0);
                      go('qr');
                    }}
                  >
                    <CardGloss borderRadius={18} />
                    <View style={styles.qaIc}>
                      <TokCredIcon name="qr" size={22} color={Colors.b} />
                    </View>
                    <Text style={styles.qaText}>Show QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.card, styles.qaCard]}
                    activeOpacity={0.8}
                    onPress={() => setSheetVisible(true)}
                  >
                    <CardGloss borderRadius={18} />
                    <View style={styles.qaIc}>
                      <TokCredIcon name="share" size={22} color={Colors.b} />
                    </View>
                    <Text style={styles.qaText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      }

      case 'creds': {
        // If student has NOT connected wallet, prompt to connect
        if (!account) {
          return (
            <View>
              <View style={styles.top}>
                {renderLogo()}
                <View style={styles.av}>
                  <Text style={styles.avText}>ST</Text>
                </View>
              </View>
              <Text style={styles.h1}>My Credentials</Text>
              <Text style={styles.sub}>Your verified academic achievements on Sepolia</Text>

              <View style={[styles.card, { padding: 24, marginTop: 28, alignItems: 'center', borderRadius: 24 }]}>
                <CardGloss borderRadius={24} />
                <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.bs, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                  <TokCredIcon name="lock" size={30} color={Colors.b} />
                </View>
                <Text style={[styles.h2, { textAlign: 'center', marginBottom: 6 }]}>
                  Wallet Not Connected
                </Text>
                <Text style={[styles.sub, { textAlign: 'center', marginBottom: 20, marginVertical: 0 }]}>
                  Please connect your student wallet to view and manage your credentials.
                </Text>
                <TouchableOpacity
                  style={[styles.btn, styles.pri]}
                  activeOpacity={0.85}
                  onPress={() => connectWallet()}
                >
                  <PriGloss />
                  <TokCredIcon name="shield" size={18} color="#fff" />
                  <Text style={styles.btnTextPri}>Connect Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

        const list = credentials.map((c, i) => ({ c, i })).filter(({ c }) =>
          (c.degree + c.institution + c.program).toLowerCase().includes(q.toLowerCase())
        );
        return (
          <View>
            <View style={styles.top}>
              {renderLogo()}
              <View style={styles.av}>
                <Text style={styles.avText}>✓</Text>
              </View>
            </View>
            <Text style={styles.h1}>My Credentials</Text>
            <Text style={styles.sub}>Wallet: {account.slice(0, 6)}...{account.slice(-4)} • Sepolia</Text>

            <View style={styles.srch}>
              <TokCredIcon name="search" size={22} color={Colors.t3} />
              <TextInput
                style={styles.srchInput}
                placeholder="Search credentials"
                placeholderTextColor={Colors.t3}
                value={q}
                onChangeText={setQ}
              />
            </View>

            <View style={{ marginTop: 22 }}>
              {loadingCreds ? (
                <ActivityIndicator color={Colors.b} style={{ marginVertical: 30 }} />
              ) : list.length > 0 ? (
                list.map(({ c, i }) => renderCredentialCard(c, i))
              ) : (
                <View style={styles.emp}>
                  <View style={styles.empIc}>
                    <TokCredIcon name="cards" size={28} color={Colors.t3} />
                  </View>
                  <Text style={styles.h2}>No credentials yet</Text>
                  <Text style={[styles.sub, { marginVertical: 0 }]}>
                    No credentials have been issued to this wallet address on Sepolia.
                  </Text>
                  <TouchableOpacity
                    style={[styles.btn, styles.sec2, { width: 'auto', paddingHorizontal: 28, height: 46, marginTop: 16 }]}
                    onPress={loadBlockchainCredentials}
                  >
                    <Text style={styles.btnTextSec}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
      }

      case 'detail': {
        const c = verifiedRecord || credentials[cur] || {
          tokenId: '0',
          degree: 'Academic Credential',
          program: 'Computer Science & Engineering',
          institution: 'Verified University',
          monogram: 'VU',
          year: '2024',
          studentName: account ? shortenAddress(account) : 'Student',
          grade: 'Verified',
          status: 'Verified',
        };
        const studentDisplayName = c.studentName || (account ? shortenAddress(account) : 'Student');
        return (
          <View>
            {renderTopBar('Credential Details')}

            {/* Official Academic Certificate Card with Guaranteed Android Visibility */}
            <View style={styles.idc}>
              <View style={styles.idcRow}>
                <View style={styles.idcMonogramBadge}>
                  <Text style={styles.idcMonogramText}>{c.monogram || 'TC'}</Text>
                </View>
                <View style={styles.idcVb}>
                  <TokCredIcon name="check" size={13} color="#15803D" strokeWidth={2.4} />
                  <Text style={styles.idcVbText}>{c.status || 'Verified'}</Text>
                </View>
              </View>

              <Text style={styles.idcH2} numberOfLines={2}>{c.degree}</Text>
              <Text style={styles.idcP} numberOfLines={1}>{c.program}</Text>
              <Text style={styles.idcInst} numberOfLines={1}>{c.institution}</Text>

              <View style={styles.idcFoot}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                    {studentDisplayName}
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 12, marginTop: 2 }}>
                    Issued {c.year}
                  </Text>
                </View>
                <View style={styles.idcTokenBadge}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                    Token #{c.tokenId}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.sec, { marginTop: 24 }]}>
              <Text style={[styles.h2, { marginBottom: 8 }]}>Credential Information</Text>
              {renderKV('Student Name', studentDisplayName)}
              {renderKV('Degree', c.degree)}
              {renderKV('Program', c.program)}
              {renderKV('Institution', c.institution)}
              {renderKV('Issue Date', c.year)}
              {renderKV('Token ID', `#${c.tokenId}`)}
            </View>

            <View style={styles.stack}>
              <TouchableOpacity
                style={[styles.btn, styles.pri]}
                activeOpacity={0.85}
                onPress={() => go('qr')}
              >
                <PriGloss />
                <TokCredIcon name="qr" size={20} color="#fff" />
                <Text style={styles.btnTextPri}>Show QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.sec2]}
                activeOpacity={0.85}
                onPress={() => setSheetVisible(true)}
              >
                <SecGloss />
                <TokCredIcon name="share" size={20} color={Colors.t} />
                <Text style={styles.btnTextSec}>Share Credential</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.sec2]}
                activeOpacity={0.85}
                onPress={() => verifyTokenOnChain(c.tokenId)}
              >
                <SecGloss />
                <TokCredIcon name="shield" size={20} color={Colors.t} />
                <Text style={styles.btnTextSec}>Verify Credential</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }


      case 'qr': {
        const c = credentials[cur] || { tokenId: '0', degree: 'Credential', institution: 'University' };
        return (
          <View>
            {renderTopBar('Share Credential')}
            <Text style={[styles.sub, { textAlign: 'center', marginTop: -6 }]}>
              Scan this QR code to verify your credential.
            </Text>

            <View style={[styles.card, styles.qrc]}>
              <CardGloss borderRadius={24} />
              <QrSvg seed={c.tokenId} size={200} />
            </View>

            <View style={[styles.ctr, { marginTop: 20, gap: 4 }]}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.t }}>{c.degree}</Text>
              <Text style={styles.meta}>{c.institution}</Text>
              <View style={{ marginTop: 8 }}>{renderVerifiedBadge()}</View>
            </View>

            <View style={styles.stack}>
              <TouchableOpacity
                style={[styles.btn, styles.pri]}
                activeOpacity={0.85}
                onPress={() => setSheetVisible(true)}
              >
                <PriGloss />
                <TokCredIcon name="share" size={20} color="#fff" />
                <Text style={styles.btnTextPri}>Share Credential</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.sec2]}
                activeOpacity={0.85}
                onPress={copyCode}
              >
                <SecGloss />
                <TokCredIcon name="copy" size={20} color={Colors.t} />
                <Text style={styles.btnTextSec}>Copy Token ID</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      case 'vhome':
        return (
          <View>
            <View style={styles.top}>
              {renderLogo()}
              <View style={styles.av}>
                <Text style={styles.avText}>{isStudent ? 'ST' : 'VR'}</Text>
              </View>
            </View>
            <Text style={styles.h1}>Verify a Credential</Text>
            <Text style={styles.sub}>Confirm the authenticity of an academic credential on Sepolia blockchain.</Text>

            <TouchableOpacity
              style={[styles.card, styles.big, { marginTop: 24, borderRadius: 24 }]}
              activeOpacity={0.85}
              onPress={() => go('scan')}
            >
              <CardGloss borderRadius={24} />
              <View style={[styles.mono, styles.monoLarge]}>
                <TokCredIcon name="qr" size={24} color="#fff" />
              </View>
              <Text style={[styles.h2, { marginTop: 18 }]}>Scan QR Code</Text>
              <Text style={[styles.sub, { marginBottom: 18 }]}>Scan the credential's QR code</Text>
              <View style={[styles.btn, styles.pri]}>
                <PriGloss />
                <Text style={styles.btnTextPri}>Scan QR</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.sec}>
              <Text style={styles.h2}>Enter Token ID or Code</Text>
              <TextInput
                style={[styles.fi, { marginVertical: 12 }]}
                placeholder="e.g. 0 or 1 or Token ID"
                placeholderTextColor={Colors.t3}
                value={code}
                onChangeText={setCode}
              />
              <TouchableOpacity
                style={[styles.btn, styles.sec2]}
                activeOpacity={0.85}
                onPress={() => {
                  const v = code.trim();
                  if (v) {
                    verifyTokenOnChain(v);
                  } else {
                    go('manual');
                  }
                }}
              >
                <SecGloss />
                <Text style={styles.btnTextSec}>Verify on Chain</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'manual':
        return (
          <View>
            {renderTopBar('')}
            <Text style={styles.h1}>Enter Token ID</Text>
            <Text style={styles.sub}>Enter the Token ID to query Ethereum Sepolia directly.</Text>

            <TextInput
              style={[
                styles.fi,
                st === 'er' && styles.fiError,
                st === 'ok' && styles.fiOk,
                { marginTop: 24 },
              ]}
              placeholder="e.g. 0"
              placeholderTextColor={Colors.t3}
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setSt(text ? 'ok' : '');
              }}
            />

            <Text style={[styles.hint, st === 'er' && styles.hintError]}>
              Enter numeric Token ID to check the smart contract.
            </Text>

            <View style={styles.stack}>
              <TouchableOpacity
                style={[styles.btn, styles.pri]}
                activeOpacity={0.85}
                onPress={() => {
                  if (!code.trim()) {
                    setSt('er');
                    return;
                  }
                  verifyTokenOnChain(code);
                }}
              >
                <PriGloss />
                <Text style={styles.btnTextPri}>Verify Credential</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'scan':
        return renderScanScreen();

      case 'load':
        return (
          <View style={[styles.ld, { minHeight: 440 }]}>
            <View style={styles.rg}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseAnim1 }],
                    opacity: pulseOpacity1,
                  },
                ]}
              />
              <View style={styles.rgSd}>
                <TokCredIcon name="shield" size={28} color="#fff" />
              </View>
            </View>

            <Text style={styles.h2}>Querying Sepolia Node…</Text>
            <Text style={[styles.sub, { marginVertical: 0, marginBottom: 16 }]}>
              Connecting to Ethereum Smart Contract.
            </Text>

            <View style={[styles.stp, loadStep1 && styles.stpOn]}>
              <TokCredIcon name="check" size={15} color={Colors.g} strokeWidth={2.4} />
              <Text style={styles.stpText}>Calling getCredentialDetails()</Text>
            </View>
            <View style={[styles.stp, loadStep2 && styles.stpOn]}>
              <TokCredIcon name="check" size={15} color={Colors.g} strokeWidth={2.4} />
              <Text style={styles.stpText}>Resolving IPFS Metadata</Text>
            </View>
            <View style={[styles.stp, loadStep3 && styles.stpOn]}>
              <TokCredIcon name="check" size={15} color={Colors.g} strokeWidth={2.4} />
              <Text style={styles.stpText}>Validating Soulbound State</Text>
            </View>
          </View>
        );

      case 'ok': {
        const c = verifiedRecord || credentials[0];
        if (!c) return null;
        return (
          <View>
            <View style={[styles.ctr, { paddingTop: 16 }]}>
              <View style={[styles.res, styles.resOk]}>
                <TokCredIcon name="check" size={44} color={Colors.g} strokeWidth={2} />
              </View>
              <Text style={styles.h1}>Credential Verified</Text>
              <Text style={[styles.sub, { maxWidth: 290, textAlign: 'center' }]}>
                This credential is cryptographically authentic and verified on Ethereum Sepolia.
              </Text>
            </View>

            <View style={[styles.card, styles.cc, { marginTop: 22 }]}>
              <CardGloss borderRadius={18} />
              <View style={styles.mono}>
                <Text style={styles.monoText}>{c.monogram}</Text>
              </View>
              <View style={styles.ccContent}>
                <Text style={styles.ccTitle}>{c.degree}</Text>
                <Text style={styles.meta}>{c.program}</Text>
                <Text style={styles.meta}>{c.institution}</Text>
              </View>
              {renderVerifiedBadge('Authentic')}
            </View>

            <View style={[styles.card, { padding: 20, marginTop: 20 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.meta}>Student</Text>
              <Text style={{ fontSize: 24, fontWeight: '600', letterSpacing: -0.6, marginTop: 4, color: Colors.t }}>
                {c.studentName}
              </Text>
              <Text style={[styles.meta, { fontSize: 14, marginTop: 4 }]}>{c.program}</Text>
              <View style={{ height: 1, backgroundColor: Colors.ln, marginVertical: 16 }} />

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                <View style={{ width: '45%' }}>
                  <Text style={[styles.meta, { fontSize: 12 }]}>Degree</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', marginTop: 4, color: Colors.t }}>{c.degree}</Text>
                </View>
                <View style={{ width: '45%' }}>
                  <Text style={[styles.meta, { fontSize: 12 }]}>Grade / GPA</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', marginTop: 4, color: Colors.t }}>{c.grade}</Text>
                </View>
                <View style={{ width: '45%' }}>
                  <Text style={[styles.meta, { fontSize: 12 }]}>Institution</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', marginTop: 4, color: Colors.t }}>{c.institution}</Text>
                </View>
                <View style={{ width: '45%' }}>
                  <Text style={[styles.meta, { fontSize: 12 }]}>Issue date</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', marginTop: 4, color: Colors.t }}>{c.year}</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 22 }}>
              <Text style={[styles.h2, { marginBottom: 4 }]}>Verification Details</Text>
              {renderKV('Token ID', `#${c.tokenId}`)}
              {renderKV('Issuer', c.institution)}
              {renderKV('Issued Date', c.year)}
              {renderKV('Verification Status', 'Authentic On-Chain')}
            </View>

            <View style={[styles.card, { padding: 16, paddingHorizontal: 18, marginTop: 20 }]}>
              <CardGloss borderRadius={18} />
              <Text style={styles.h2}>Ledger Proof</Text>
              {renderKV('Smart Contract', `${CONTRACT_ADDRESS.slice(0, 10)}...`)}
              <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.ln }}>
                <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`)}>
                  <Text style={styles.linkText}>View on Sepolia Etherscan →</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.stack, { marginBottom: 24 }]}>
              <TouchableOpacity
                style={[styles.btn, styles.sec2]}
                activeOpacity={0.85}
                onPress={shareV}
              >
                <SecGloss />
                <TokCredIcon name="share" size={20} color={Colors.t} />
                <Text style={styles.btnTextSec}>Share Verification</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.pri]}
                activeOpacity={0.85}
                onPress={() => go('detail')}
              >
                <PriGloss />
                <Text style={styles.btnTextPri}>View Credential</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.sec2]}
                activeOpacity={0.85}
                onPress={() => go('vhome')}
              >
                <SecGloss />
                <Text style={styles.btnTextSec}>Verify Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      case 'no':
        return (
          <View>
            <View style={[styles.ctr, { paddingTop: 20 }]}>
              <View style={[styles.res, styles.resNo]}>
                <TokCredIcon name="alertCircle" size={44} color={Colors.alert} />
              </View>
              <Text style={[styles.h1, { textAlign: 'center' }]}>Credential Could Not Be Verified</Text>
              <Text style={[styles.sub, { textAlign: 'center' }]}>The credential was not found or has been revoked.</Text>
            </View>

            <View style={[styles.card, { marginTop: 24, paddingHorizontal: 18, paddingVertical: 8 }]}>
              <CardGloss borderRadius={22} />
              <View style={styles.rsn}>
                <View style={styles.rsnDot} />
                <Text style={styles.rsnText}>Token ID does not exist on Sepolia</Text>
              </View>
              <View style={styles.rsn}>
                <View style={styles.rsnDot} />
                <Text style={styles.rsnText}>Credential has been revoked by Issuer</Text>
              </View>
              <View style={styles.rsn}>
                <View style={styles.rsnDot} />
                <Text style={styles.rsnText}>Network timeout connecting to RPC</Text>
              </View>
            </View>

            <View style={styles.stack}>
              <TouchableOpacity
                style={[styles.btn, styles.pri]}
                activeOpacity={0.85}
                onPress={() => verifyTokenOnChain(code || '0')}
              >
                <PriGloss />
                <Text style={styles.btnTextPri}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.sec2]}
                activeOpacity={0.85}
                onPress={() => {
                  setCode('');
                  setSt('');
                  go('manual');
                }}
              >
                <SecGloss />
                <Text style={styles.btnTextSec}>Enter Another Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'profile': {
        const renderRow = (iconName: string, label: string, onPress?: () => void) => (
          <TouchableOpacity style={styles.grpRow} activeOpacity={0.8} onPress={onPress}>
            <View style={styles.grpRowLeft}>
              <TokCredIcon name={iconName} size={20} color={Colors.b} />
              <Text style={styles.grpRowLabel}>{label}</Text>
            </View>
            <TokCredIcon name="chev" size={20} color={Colors.t3} />
          </TouchableOpacity>
        );

        return (
          <View>
            <View style={[styles.ctr, { paddingTop: 12 }]}>
              <View style={[styles.av, styles.avL]}>
                <Text style={styles.avLText}>{isStudent ? (account ? '✓' : 'ST') : 'VR'}</Text>
              </View>
              <Text style={[styles.h1, { fontSize: 22, marginTop: 14 }]}>
                {isStudent
                  ? account
                    ? `${account.slice(0, 6)}...${account.slice(-4)}`
                    : 'Student Profile'
                  : 'Verifier Mode'}
              </Text>
              <Text style={[styles.sub, { marginTop: 4 }]}>
                {isStudent
                  ? account
                    ? 'Connected to Sepolia'
                    : 'Wallet Not Connected'
                  : 'Public Verification Node'}
              </Text>
            </View>

            {/* Role indicator chip (locked - no switcher) */}
            <View style={{ alignItems: 'center', marginVertical: 14 }}>
              <View style={[styles.vb, { backgroundColor: Colors.bs, paddingVertical: 6, paddingHorizontal: 16 }]}>
                <TokCredIcon name={isStudent ? 'cards' : 'shield'} size={14} color={Colors.b} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.b, marginLeft: 4 }}>
                  {isStudent ? 'Active Role: Student' : 'Active Role: Verifier'}
                </Text>
              </View>
            </View>

            <Text style={styles.gh}>Account</Text>
            <View style={styles.grp}>
              <CardGloss borderRadius={18} />
              {renderRow(
                'user',
                isStudent ? 'Personal Information' : 'Organization & Scanner',
                () => toast(isStudent ? 'Student Account: Sepolia Network' : 'Verifier Node: Public Access')
              )}
              {isStudent && (
                <TouchableOpacity
                  style={styles.grpRow}
                  activeOpacity={0.8}
                  onPress={() => (account ? disconnectWallet() : connectWallet())}
                >
                  <View style={styles.grpRowLeft}>
                    <TokCredIcon name="lock" size={20} color={Colors.b} />
                    <Text style={styles.grpRowLabel}>
                      {account ? 'Disconnect Wallet' : 'Connect Wallet (MetaMask)'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: Colors.b, fontWeight: '500' }}>
                    {account ? 'Connected ✓' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              )}
              {/* Logout & Switch Role */}
              <TouchableOpacity
                style={styles.grpRow}
                activeOpacity={0.8}
                onPress={handleLogout}
              >
                <View style={styles.grpRowLeft}>
                  <TokCredIcon name="refresh" size={20} color={Colors.alert} />
                  <Text style={[styles.grpRowLabel, { color: Colors.alert }]}>
                    Logout & Switch Role
                  </Text>
                </View>
                <TokCredIcon name="chev" size={20} color={Colors.t3} />
              </TouchableOpacity>
            </View>

            <Text style={styles.gh}>Preferences</Text>
            <View style={styles.grp}>
              <CardGloss borderRadius={18} />
              {renderRow('bell', 'Notifications', () => setNotifModalVisible(true))}
            </View>

            <Text style={styles.gh}>About & Legal</Text>
            <View style={styles.grp}>
              <CardGloss borderRadius={18} />
              {renderRow('info', 'About TokCred', () => go('about'))}
              {renderRow('doc', 'Privacy Policy', () => go('privacy'))}
              {renderRow('doc', 'Terms of Service', () => go('terms'))}
            </View>
          </View>
        );
      }

      case 'about':
        return (
          <View>
            {renderTopBar('About TokCred')}
            <View style={[styles.card, { padding: 20, marginBottom: 16 }]}>
              <CardGloss borderRadius={22} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <View style={styles.lm}>
                  <TokCredIcon name="shield" size={18} color="#fff" strokeWidth={2.2} />
                </View>
                <View>
                  <Text style={[styles.h2, { marginBottom: 2 }]}>TokCred Protocol</Text>
                  <Text style={{ fontSize: 12, color: Colors.t2 }}>Version 2.4.0 • Ethereum Sepolia Network</Text>
                </View>
              </View>
              <Text style={styles.docP}>
                TokCred is a pioneering decentralized credential verification platform designed to eliminate academic diploma fraud and provide students self-sovereignty over their degrees.
              </Text>
              <Text style={styles.docP}>
                By leveraging the cryptographic security and immutability of the Ethereum blockchain, accredited educational institutions mint tamper-proof digital credentials directly to student addresses.
              </Text>
            </View>

            <Text style={styles.gh}>Core Architecture</Text>
            <View style={[styles.card, { padding: 18, marginBottom: 16, gap: 14 }]}>
              <CardGloss borderRadius={22} />
              <View style={styles.docFeature}>
                <View style={styles.docDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docFeatureTitle}>Soulbound Tokens (ERC-721)</Text>
                  <Text style={styles.docFeatureSub}>
                    Diplomas are non-transferable NFTs permanently bound to the student recipient. They cannot be sold, traded, or transferred to another address.
                  </Text>
                </View>
              </View>
              <View style={styles.docFeature}>
                <View style={styles.docDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docFeatureTitle}>Decentralized Storage (IPFS)</Text>
                  <Text style={styles.docFeatureSub}>
                    Degree metadata, transcripts, and institution signatures are pinned to IPFS via Pinata with cryptographic content hashes.
                  </Text>
                </View>
              </View>
              <View style={styles.docFeature}>
                <View style={styles.docDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docFeatureTitle}>Instant Verifier Trust</Text>
                  <Text style={styles.docFeatureSub}>
                    Employers scan QR codes to verify authenticity against the Ethereum blockchain in under 2 seconds without third-party fees.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { padding: 16, marginBottom: 20 }]}>
              <CardGloss borderRadius={22} />
              <Text style={[styles.h2, { fontSize: 15, marginBottom: 6 }]}>Deployed Smart Contract</Text>
              <Text style={{ fontSize: 12, color: Colors.t2, fontFamily: 'monospace' }}>{CONTRACT_ADDRESS}</Text>
            </View>

            <TouchableOpacity style={[styles.btn, styles.pri]} onPress={goBack} activeOpacity={0.85}>
              <PriGloss />
              <Text style={styles.btnTextPri}>Back to Settings</Text>
            </TouchableOpacity>
          </View>
        );

      case 'privacy':
        return (
          <View>
            {renderTopBar('Privacy Policy')}
            <Text style={[styles.sub, { marginTop: -10, marginBottom: 16 }]}>Last Updated: October 2026</Text>

            <View style={[styles.card, { padding: 20, marginBottom: 14 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>1. Cryptographic Privacy by Design</Text>
              <Text style={styles.docP}>
                TokCred operates on a privacy-preserving model. While Ethereum is a public blockchain, personal student records are not published in raw text. Only cryptographic content hashes (IPFS CIDs) and ownership states are anchored on-chain.
              </Text>
            </View>

            <View style={[styles.card, { padding: 20, marginBottom: 14 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>2. Wallet Self-Sovereignty</Text>
              <Text style={styles.docP}>
                TokCred does not collect, record, or possess access to your private keys or seed phrases. Connection occurs locally via WalletConnect / MetaMask. You remain the sole custodian of your digital assets.
              </Text>
            </View>

            <View style={[styles.card, { padding: 20, marginBottom: 14 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>3. Metadata & Document Storage</Text>
              <Text style={styles.docP}>
                Credential metadata is hashed and pinned to IPFS. Only verified hashes and revocation flags are tracked on-chain. Institutions maintain academic compliance with data protection laws.
              </Text>
            </View>

            <View style={[styles.card, { padding: 20, marginBottom: 24 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>4. Zero Data Selling</Text>
              <Text style={styles.docP}>
                TokCred never sells, monetizes, or shares your personal credential records with advertisers. Verification queries interact directly with decentralized RPC endpoints.
              </Text>
            </View>

            <TouchableOpacity style={[styles.btn, styles.pri]} onPress={goBack} activeOpacity={0.85}>
              <PriGloss />
              <Text style={styles.btnTextPri}>Back to Settings</Text>
            </TouchableOpacity>
          </View>
        );

      case 'terms':
        return (
          <View>
            {renderTopBar('Terms of Service')}
            <Text style={[styles.sub, { marginTop: -10, marginBottom: 16 }]}>Last Updated: October 2026</Text>

            <View style={[styles.card, { padding: 20, marginBottom: 14 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>1. Agreement to Terms</Text>
              <Text style={styles.docP}>
                By accessing TokCred and connecting an Ethereum wallet, you agree to comply with all smart contract protocols and network rules outlined herein.
              </Text>
            </View>

            <View style={[styles.card, { padding: 20, marginBottom: 14 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>2. Soulbound Nature</Text>
              <Text style={styles.docP}>
                Tokens issued through this platform are strictly Soulbound (non-transferable). Any attempts to transfer, resell, or delegate credential tokens are rejected by the underlying ERC-721 smart contract.
              </Text>
            </View>

            <View style={[styles.card, { padding: 20, marginBottom: 14 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>3. Issuer Responsibility & Revocation</Text>
              <Text style={styles.docP}>
                Accredited universities and colleges retain the authority to issue and, in cases of disciplinary or clerical error, revoke academic credentials on-chain. TokCred provides decentralized verification rails and is not responsible for issuer curriculum validity.
              </Text>
            </View>

            <View style={[styles.card, { padding: 20, marginBottom: 24 }]}>
              <CardGloss borderRadius={22} />
              <Text style={styles.docTitle}>4. Decentralized Network Disclaimer</Text>
              <Text style={styles.docP}>
                TokCred interacts directly with public Ethereum Sepolia RPC nodes. TokCred assumes no liability for blockchain network latency, gas fee variations, or localized device connection issues.
              </Text>
            </View>

            <TouchableOpacity style={[styles.btn, styles.pri]} onPress={goBack} activeOpacity={0.85}>
              <PriGloss />
              <Text style={styles.btnTextPri}>Back to Settings</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  // Full-Screen Live Scanner View
  const renderScanScreen = () => {
    if (!cameraPermission) {
      return (
        <View style={[styles.app, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 24 }]}>
          <ActivityIndicator size="large" color={Colors.b} />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 16, fontWeight: '500' }}>
            Initializing camera...
          </Text>
        </View>
      );
    }

    if (!cameraPermission.granted) {
      return (
        <View style={[styles.app, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 24 }]}>
          <TouchableOpacity
            style={[styles.camIb, { position: 'absolute', top: insets.top + 16, left: 20 }]}
            onPress={goBack}
            activeOpacity={0.8}
          >
            <TokCredIcon name="back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59, 130, 246, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <TokCredIcon name="qr" size={40} color={Colors.b} />
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>
            Camera Permission Required
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
            TokCred uses the camera to scan QR codes on student diplomas and instantly verify them on Ethereum Sepolia.
          </Text>
          <TouchableOpacity
            style={[styles.btn, styles.pri, { marginBottom: 12 }]}
            activeOpacity={0.85}
            onPress={async () => {
              const res = await requestCameraPermission();
              if (!res.granted) {
                toast('Camera permission denied');
              }
            }}
          >
            <Text style={styles.btnTextPri}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
            activeOpacity={0.85}
            onPress={() => go('manual')}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Enter Token ID Manually</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={StyleSheet.absoluteFill}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
        />
        <View style={[styles.camOverlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.camTopRow}>
            <TouchableOpacity style={styles.camIb} onPress={goBack} activeOpacity={0.8}>
              <TokCredIcon name="back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.camTitle}>Scan Credential QR</Text>
            <TouchableOpacity
              style={[styles.camIb, flashOn && { backgroundColor: Colors.b }]}
              onPress={() => setFlashOn((prev) => !prev)}
              activeOpacity={0.8}
            >
              <TokCredIcon name="bolt" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.camFrameContainer}>
            <View style={styles.camFrame}>
              <View style={[styles.corner, styles.cornerA]} />
              <View style={[styles.corner, styles.cornerB]} />
              <View style={[styles.corner, styles.cornerC]} />
              <View style={[styles.corner, styles.cornerD]} />
              <Animated.View style={[styles.scanLine, { top: scanLaser }]} />
            </View>
            <Text style={styles.camHelpText}>
              Align the credential QR code inside the frame
            </Text>
          </View>

          <View style={{ width: '100%', gap: 12 }}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: 'rgba(0,0,0,0.65)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }]}
              activeOpacity={0.85}
              onPress={() => go('manual')}
            >
              <TokCredIcon name="shield" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Enter Token ID Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // If scanning, show full screen camera directly
  if (scr === 'scan') {
    return (
      <View style={styles.app}>
        <StatusBar style="light" />
        {renderScanScreen()}
        {toastVisible && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <AppBackdrop />
      <StatusBar style="light" />
      <Animated.ScrollView
        style={[
          styles.view,
          {
            paddingTop: insets.top + 12,
            transform: [{ translateX: screenTranslate }],
          },
        ]}
        contentContainerStyle={{
          paddingBottom: showNav ? 140 : Math.max(insets.bottom, 16) + 70,
        }}
        showsVerticalScrollIndicator={false}
      >
        {renderScreenContent()}
      </Animated.ScrollView>

      {/* Floating Liquid-Glass Bottom Navigation — Option C (no live blur) */}
      {showNav && (
        <View
          style={[
            styles.navContainer,
            { bottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          {/* Clip view for gradient layers — does NOT eat touches */}
          <View
            style={[StyleSheet.absoluteFill, styles.navClip]}
            pointerEvents="none"
          >
            {/* 145° specular fill */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.17)', 'rgba(255, 255, 255, 0.06)']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Inset ambient top glow */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Tapered top rim highlight */}
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0)',
                'rgba(255, 255, 255, 0.38)',
                'rgba(255, 255, 255, 0)',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.navTopRimGrad}
            />
          </View>
          {/* Lit border overlay */}
          <View style={styles.navBorderOverlay} pointerEvents="none" />
          {/* Touch interactive button container */}
          <View style={styles.navInner}>
            {tabsList.map((tab) => {
              const isOn = currentTabOn === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.navBtn, isOn && styles.navBtnOn]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (scr !== tab.id) {
                      if (tab.id === 'scan') {
                        setHasScanned(false);
                      }
                      setHist((prev) => [...prev, scr]);
                      setScr(tab.id as ScreenType);
                    }
                  }}
                >
                  <TokCredIcon
                    name={tab.icon}
                    size={20}
                    strokeWidth={2.0}
                    color={isOn ? '#7DB4FF' : '#94A3B8'}
                  />
                  <Text style={[styles.navLabel, isOn && styles.navLabelOn]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Floating Toast */}
      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {/* Share Bottom Sheet */}
      <Modal visible={sheetVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setSheetVisible(false)}
        >
          <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.h2, { marginBottom: 6 }]}>Share Credential</Text>
            {['Copy link', 'Send via Messages', 'Save as PDF'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.kv}
                disabled={item === 'Save as PDF' && isGeneratingPdf}
                onPress={async () => {
                  if (item === 'Save as PDF') {
                    if (isGeneratingPdf) return;
                    setIsGeneratingPdf(true);
                    setSheetVisible(false);
                    toast('Generating PDF...');
                    try {
                      const credToPrint =
                        (scr === 'detail' || scr === 'ok' ? verifiedRecord : null) ||
                        credentials[cur] ||
                        verifiedRecord;
                      if (!credToPrint) {
                        toast('No credential selected');
                        return;
                      }
                      await saveCertificatePdf(credToPrint);
                      toast('Saved as PDF');
                    } catch (err: any) {
                      console.error('Failed to save PDF:', err);
                      toast(err?.message || 'Failed to generate PDF');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  } else {
                    setSheetVisible(false);
                    toast(item === 'Copy link' ? 'Link copied' : 'Done');
                  }
                }}
              >
                {item === 'Save as PDF' && isGeneratingPdf ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={Colors.b} style={{ marginRight: 8 }} />
                    <Text style={[styles.kvLabel, { color: Colors.t }]}>Generating PDF...</Text>
                  </View>
                ) : (
                  <Text style={[styles.kvLabel, { color: Colors.t }]}>{item}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={notifModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setNotifModalVisible(false)}
        >
          <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.h2, { marginBottom: 4 }]}>Notification Preferences</Text>
            <Text style={[styles.sub, { marginBottom: 18, marginTop: 0 }]}>
              Customize your credential alert settings
            </Text>

            <TouchableOpacity
              style={styles.notifRow}
              activeOpacity={0.8}
              onPress={() => setNotifIssuance(!notifIssuance)}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.notifTitle}>Credential Issuance</Text>
                <Text style={styles.notifSub}>Alerts when an institution mints a diploma to your address</Text>
              </View>
              <View style={[styles.toggleTrack, notifIssuance && styles.toggleTrackOn]}>
                <View style={[styles.toggleThumb, notifIssuance && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notifRow}
              activeOpacity={0.8}
              onPress={() => setNotifVerify(!notifVerify)}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.notifTitle}>Verification Receipts</Text>
                <Text style={styles.notifSub}>Receive a notification when an employer validates your diploma</Text>
              </View>
              <View style={[styles.toggleTrack, notifVerify && styles.toggleTrackOn]}>
                <View style={[styles.toggleThumb, notifVerify && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notifRow}
              activeOpacity={0.8}
              onPress={() => setNotifNetwork(!notifNetwork)}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.notifTitle}>Sepolia Network Status</Text>
                <Text style={styles.notifSub}>Ethereum testnet gas and RPC node updates</Text>
              </View>
              <View style={[styles.toggleTrack, notifNetwork && styles.toggleTrackOn]}>
                <View style={[styles.toggleThumb, notifNetwork && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.pri, { marginTop: 16 }]}
              activeOpacity={0.85}
              onPress={() => {
                setNotifModalVisible(false);
                toast('Notification preferences saved');
              }}
            >
              <Text style={styles.btnTextPri}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Mobile-Optimized Styles with responsive sizing and Light/Dark themes
const getStyles = (Colors: typeof LightColors) => StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  view: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    minHeight: 40,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontWeight: '600',
    letterSpacing: -0.3,
    fontSize: 17,
    color: Colors.t,
  },

  lm: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.b,
    justifyContent: 'center',
    alignItems: 'center',
  },
  av: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avText: {
    color: Colors.b,
    fontWeight: '600',
    fontSize: 14,
  },
  avL: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avLText: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.b,
  },
  ib: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.s,
    borderWidth: 1,
    borderColor: Colors.ln,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: Colors.t,
  },
  h1: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.6,
    lineHeight: 30,
    color: Colors.t,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: Colors.t,
  },
  sub: {
    color: Colors.t2,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  meta: {
    fontSize: 13,
    color: Colors.t2,
  },
  sec: {
    marginTop: 26,
  },
  sh: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  linkText: {
    color: Colors.b,
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    // Option-C: specular translucent fill, no blur
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 36,
    elevation: 0,
  },
  big: {
    padding: 24,
  },
  hero: {
    borderRadius: 30,
    padding: 24,
    marginTop: 20,
    position: 'relative',
    // hero blue specular gradient — flat but lets orbs show through
    backgroundColor: 'rgba(59, 140, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#3B8CFF',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 0,
  },
  heroN: {
    fontSize: 52,
    fontWeight: '600',
    letterSpacing: -2,
    lineHeight: 56,
    marginVertical: 8,
    color: Colors.t,
  },
  heroSd: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.b,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.heroIcon,
  },
  heroTopRim: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
  },
  cc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.b,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 0,
  },
  mono: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 140, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monoLarge: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: Colors.b,
  },
  monoText: {
    color: '#7DB4FF',
    fontWeight: '600',
    fontSize: 15,
  },
  ccContent: {
    flex: 1,
  },
  ccTitle: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.1,
    color: Colors.t,
  },
  ccRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  vb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gs,
    paddingVertical: 3,
    paddingRight: 8,
    paddingLeft: 6,
    borderRadius: 99,
  },
  vbText: {
    color: Colors.g,
    fontSize: 11,
    fontWeight: '500',
  },
  qa: {
    flexDirection: 'row',
    gap: 12,
  },
  qaCard: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 0,
  },
  qaIc: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(59, 140, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qaText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.t,
  },
  btn: {
    width: '100%',
    height: 54,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pri: {
    // Glossy 3-stop gradient rendered via LinearGradient wrapper in renderPriBtn
    // base solid fallback for StyleSheet composition — actual color comes from gradient
    backgroundColor: '#1677FF',
    borderRadius: 15,
    height: 54,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  sec2: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    height: 54,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 0,
  },
  btnTextPri: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  btnTextSec: {
    color: Colors.t,
    fontWeight: '600',
    fontSize: 15,
  },
  stack: {
    gap: 12,
    marginTop: 26,
  },
  navContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    borderRadius: 30,
    // Option-C nav: no overflow:hidden here so the outer drop shadow is not clipped
    backgroundColor: 'rgba(9, 11, 16, 0.72)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 9999,
  },
  navClip: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  navTopRimGrad: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
  },
  navBorderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    zIndex: 10,
    elevation: 0,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 7,
    borderRadius: 22,
  },
  navBtnOn: {
    backgroundColor: 'rgba(59, 140, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderTopColor: 'rgba(255, 255, 255, 0.40)',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  navLabelOn: {
    color: '#7DB4FF',
    fontWeight: '600',
  },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ln,
    gap: 16,
  },
  kvLabel: {
    fontSize: 13,
    color: Colors.t2,
    width: 85,
    flexShrink: 0,
    fontWeight: '500',
  },
  kvVal: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    color: Colors.t,
    flex: 1,
    lineHeight: 18,
  },
  idc: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#1E40AF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    elevation: 3,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  idcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  idcMonogramBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idcMonogramText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  idcVb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  idcVbText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  idcH2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 4,
  },
  idcP: {
    fontSize: 13,
    color: '#DBEAFE',
    fontWeight: '500',
    marginBottom: 2,
  },
  idcInst: {
    fontSize: 13,
    color: '#BFDBFE',
    fontWeight: '600',
    marginTop: 2,
  },
  idcFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  idcTokenBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  srch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.s2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 18,
  },
  srchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.t,
  },
  qrc: {
    backgroundColor: '#F7F9FC', // Solid near-white so QR stays 100% scannable
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  fi: {
    width: '100%',
    height: 56,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    color: '#F2F4F8',
  },
  fiOk: {
    borderColor: '#3DD68C',
    backgroundColor: 'rgba(61, 214, 140, 0.08)',
  },
  fiError: {
    borderColor: '#FF6B66',
    backgroundColor: 'rgba(217, 83, 79, 0.10)',
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    color: Colors.t2,
  },
  hintError: {
    color: Colors.errorText,
  },
  ctr: {
    alignItems: 'center',
  },
  res: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 16,
  },
  resOk: {
    backgroundColor: Colors.gs,
  },
  resNo: {
    backgroundColor: Colors.alertBg,
  },
  rsn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ln,
  },
  rsnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.alert,
    opacity: 0.6,
  },
  rsnText: {
    fontSize: 14,
    color: Colors.t,
  },
  ld: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rg: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: Colors.b,
  },
  rgSd: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: Colors.b,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.35,
    marginVertical: 3,
  },
  stpOn: {
    opacity: 1,
  },
  stpText: {
    fontSize: 13,
    color: Colors.t2,
  },
  cam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  camOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  camTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  camTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  camHelpText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.85,
    maxWidth: 260,
  },
  camIb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camFrameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  camFrame: {
    width: 240,
    height: 240,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderRadius: 14,
  },
  cornerA: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerB: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerC: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerD: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: '#5BA6FF',
  },
  grp: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 0,
    position: 'relative',
  },
  grpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.09)',
  },
  grpRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  grpRowLabel: {
    fontSize: 14,
    color: Colors.t,
  },
  gh: {
    fontSize: 12,
    color: Colors.t2,
    marginBottom: 8,
    marginLeft: 6,
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 13,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginVertical: 14,
    marginBottom: 26,
  },
  segBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segBtnOn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 0,
  },
  segBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.t2,
  },
  segBtnTextOn: {
    color: Colors.t,
  },
  emp: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  empIc: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.s2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 99,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 0,
  },
  toastText: {
    color: '#F2F4F8',
    fontSize: 14,
    fontWeight: '500',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: 'rgba(22, 25, 33, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 22,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.t,
    marginBottom: 8,
  },
  docP: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.t2,
    marginBottom: 8,
  },
  docFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  docDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.b,
    marginTop: 6,
  },
  docFeatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.t,
  },
  docFeatureSub: {
    fontSize: 12,
    color: Colors.t2,
    lineHeight: 18,
    marginTop: 2,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.s,
    borderWidth: 1.5,
    borderColor: Colors.ln,
    marginBottom: 10,
  },
  themeOptionActive: {
    borderColor: Colors.b,
    backgroundColor: Colors.bs,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  themeOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.t,
  },
  themeOptionSub: {
    fontSize: 12,
    color: Colors.t2,
    marginTop: 2,
  },
  themeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.b,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ln,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.t,
  },
  notifSub: {
    fontSize: 12,
    color: Colors.t2,
    marginTop: 2,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.s2,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.ln,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: Colors.b,
    borderColor: Colors.b,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  toggleThumbOn: {
    transform: [{ translateX: 18 }],
  },
});
