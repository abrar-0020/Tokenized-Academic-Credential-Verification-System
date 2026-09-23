'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface VerificationPortalProps {
  verificationProgress: number;
  positionZ?: number;
}

function getStep(p: number): number {
  if (p < 0.20) return 0; // Credential enters bay
  if (p < 0.40) return 1; // Checking issuer
  if (p < 0.60) return 2; // Verifying hash
  if (p < 0.80) return 3; // Matching blockchain
  return 4;               // VERIFIED
}

const matFrame   = new THREE.MeshStandardMaterial({ color: '#0c0c10', roughness: 0.95, metalness: 0.05 });
const matPanel   = new THREE.MeshStandardMaterial({ color: '#131318', roughness: 0.8,  metalness: 0.3  });

// ─── Incoming data signal beam from blockchain ────────────────────────────────
// Appears in the first 0→0.15 of verificationProgress to show the blockchain
// signal arriving at the verification station (Scene02→Scene03 continuity)
function DataSignalBeam({ verificationProgress }: { verificationProgress: number }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Only active during the approach phase (before step 1)
  const beamProgress = Math.min(1, verificationProgress / 0.18);
  const beamVisible = verificationProgress > 0 && verificationProgress < 0.25;

  useFrame((state) => {
    if (!beamRef.current || !glowRef.current) return;
    const t = state.clock.elapsedTime;
    beamRef.current.visible = beamVisible;
    glowRef.current.visible = beamVisible;
    if (beamVisible) {
      // Signal travels from z = +8 (toward blockchain) down to z = 0 (credential)
      const zPos = 8 - beamProgress * 8;
      beamRef.current.position.z = zPos;
      glowRef.current.position.z = zPos;
      const pulse = 0.5 + Math.sin(t * 12) * 0.3;
      (beamRef.current.material as THREE.MeshStandardMaterial).opacity = pulse * beamProgress;
      glowRef.current.intensity = 2.0 * pulse * beamProgress;
    }
  });

  return (
    <group>
      <mesh ref={beamRef} position={[0, 0, 8]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive={new THREE.Color('#3b82f6')}
          emissiveIntensity={3.0}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight ref={glowRef} color="#60a5fa" intensity={2} distance={6} decay={2} position={[0, 0, 8]} visible={false} />
    </group>
  );
}

// ─── Credential silhouette inside the bay ─────────────────────────────────────
// Scaled to 0.35 so it reads as a smaller, secondary element — NOT the large Scene 01 credential
function CredentialSilhouette({ step, verificationProgress }: { step: number; verificationProgress: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const certW = 4.8;
  const certH = 3.2;
  const certD = 0.18;

  const isVerified = step === 4;
  const enterProgress = Math.min(1, verificationProgress / 0.18);


  const paperMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#f0ece3', roughness: 0.8, metalness: 0.02, clearcoat: 0.05,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#c8a832', roughness: 0.25, metalness: 1.0, clearcoat: 0.4,
  }), []);

  const holoMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.05, metalness: 0.9, iridescence: 1.0,
    iridescenceIOR: 1.8, iridescenceThicknessRange: [100, 400], clearcoat: 1.0,
  }), []);

  const textMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a24', roughness: 0.6 }), []);
  const mutedMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6b7280', roughness: 0.6 }), []);

  const pendingBgMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a0c00', roughness: 0.9 }), []);
  const pendingTextMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f0a832', emissive: new THREE.Color('#f0a832'), emissiveIntensity: 0.3,
  }), []);
  const verifiedBgMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#020a1a', emissive: new THREE.Color('#0d2044'), emissiveIntensity: 0.5, roughness: 0.9,
  }), []);
  const verifiedTextMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.6,
  }), []);

  // Track elapsed time since verification achieved — drives the controlled decay
  const verifiedSince = useRef<number | null>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Descend from above into position
    meshRef.current.position.y = -1.5 + enterProgress * 1.5;

    if (step < 4) {
      // Subtle living motion while scanning
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.02;
      // Normal scan size
      meshRef.current.scale.setScalar(0.35);
    } else {
      // VERIFIED — settle to stillness (certainty, not excitement)
      if (verifiedSince.current === null) verifiedSince.current = t;
      const elapsed = t - verifiedSince.current;
      // Rotate smoothly to face-on
      meshRef.current.rotation.y += (-meshRef.current.rotation.y) * 0.04;
      meshRef.current.rotation.x += (-meshRef.current.rotation.x) * 0.04;
      // Gentle scale emphasis — from 0.35 to 0.38, no pulse
      const targetScale = 0.35 + Math.min(0.03, elapsed * 0.015);
      const cs = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(cs + (targetScale - cs) * 0.06);
    }

    if (glowRef.current) {
      if (!isVerified) {
        // Subtle blue scan glow
        glowRef.current.intensity = 1.2 + Math.sin(t * 2.5) * 0.15;
        glowRef.current.color.set('#3b82f6');
      } else {
        // After verification: calm white/blue, not pulsing wildly
        glowRef.current.intensity = 2.0;
        glowRef.current.color.set('#93c5fd');
      }
    }
  });

  return (
    // Initial scale 0.35: clearly smaller secondary element inside scanner bay.
  // VERIFIED state animates to 0.38 via useFrame above for subtle emphasis.
    <group ref={meshRef} position={[0, -1.5, 0]} scale={0.35}>
      <mesh castShadow receiveShadow material={paperMat}>
        <boxGeometry args={[certW, certH, certD]} />
      </mesh>
      <mesh material={goldMat} position={[0, certH / 2 - 0.06, certD / 2 + 0.001]}>
        <boxGeometry args={[certW - 0.12, 0.012, 0.002]} />
      </mesh>
      <mesh material={goldMat} position={[0, -(certH / 2 - 0.06), certD / 2 + 0.001]}>
        <boxGeometry args={[certW - 0.12, 0.012, 0.002]} />
      </mesh>
      <mesh material={goldMat} position={[-(certW / 2 - 0.06), 0, certD / 2 + 0.001]}>
        <boxGeometry args={[0.012, certH - 0.12, 0.002]} />
      </mesh>
      <mesh material={goldMat} position={[certW / 2 - 0.06, 0, certD / 2 + 0.001]}>
        <boxGeometry args={[0.012, certH - 0.12, 0.002]} />
      </mesh>

      <mesh material={goldMat} position={[0, 0.6, certD / 2 + 0.002]}>
        <torusGeometry args={[0.16, 0.010, 16, 64]} />
      </mesh>
      <mesh material={goldMat} position={[0, 0.6, certD / 2 + 0.003]}>
        <torusGeometry args={[0.11, 0.005, 16, 64]} />
      </mesh>

      <group position={[0, 0.2, certD / 2 + 0.005]}>
        <Text position={[0, 0.16, 0]} fontSize={0.085} letterSpacing={0.2} material={mutedMat} anchorX="center" anchorY="middle">
          EXAMPLE UNIVERSITY
        </Text>
        <Text position={[0, -0.04, 0]} fontSize={0.22} letterSpacing={0.05} material={textMat} anchorX="center" anchorY="middle">
          BACHELOR OF TECHNOLOGY
        </Text>
        <Text position={[0, -0.28, 0]} fontSize={0.16} letterSpacing={0.08} material={textMat} anchorX="center" anchorY="middle">
          ALEX CHEN
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.06} letterSpacing={0.12} material={mutedMat} anchorX="center" anchorY="middle">
          TC-2026-001284
        </Text>
      </group>

      <mesh material={holoMat} position={[certW / 2 - 0.26, 0, certD / 2 + 0.002]}>
        <boxGeometry args={[0.15, certH - 0.28, 0.002]} />
      </mesh>

      {/* PENDING / VERIFIED BADGE */}
      <group position={[0, -(certH / 2) + 0.22, certD / 2 + 0.004]}>
        <mesh material={isVerified ? verifiedBgMat : pendingBgMat}>
          <boxGeometry args={[certW - 0.28, 0.28, 0.002]} />
        </mesh>
        <mesh position={[0, 0.14, 0.001]}>
          <boxGeometry args={[certW - 0.28, 0.008, 0.001]} />
          <meshStandardMaterial
            color={isVerified ? '#ffffff' : '#b07c28'}
            emissive={new THREE.Color(isVerified ? '#ffffff' : '#b07c28')}
            emissiveIntensity={isVerified ? 0.8 : 0.5}
          />
        </mesh>
        <Text
          position={[0, 0, 0.003]}
          fontSize={0.12}
          letterSpacing={0.18}
          material={isVerified ? verifiedTextMat : pendingTextMat}
          anchorX="center"
          anchorY="middle"
        >
          {isVerified ? '✓  VERIFIED' : 'PENDING'}
        </Text>
      </group>

      <pointLight ref={glowRef} color="#3b82f6" intensity={1.5} distance={8} decay={2} position={[0, 0, 1.5]} />
    </group>
  );
}

// ─── Verification Connections ─────────────────────────────────────────────────
function IssuerConnection({ step }: { step: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isActive = step === 1;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.visible = step >= 1 && step < 4;
    if (isActive) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0 + Math.sin(t * 6) * 0.5;
    } else {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[-2.5, 0, 0.1]} visible={false}>
      <boxGeometry args={[2.0, 0.02, 0.02]} />
      <meshStandardMaterial color="#3b82f6" emissive={new THREE.Color('#3b82f6')} emissiveIntensity={1.0} transparent opacity={0.6} />
    </mesh>
  );
}

function HashExtractionConnection({ step }: { step: number }) {
  const ref = useRef<THREE.Group>(null);
  const isActive = step === 2;

  const textMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#60a5fa', emissive: new THREE.Color('#3b82f6'), emissiveIntensity: 1.0, transparent: true,
  }), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.visible = isActive;
    if (isActive) {
      const progress = (t * 1.5) % 1.0;
      ref.current.position.x = 1.0 + progress * 2.5;
      textMat.opacity = Math.sin(progress * Math.PI);
    }
  });

  return (
    <group ref={ref} position={[0, 0, 0.2]} visible={false}>
      <Text position={[0, 0, 0]} fontSize={0.15} letterSpacing={0.06} material={textMat} anchorX="center" anchorY="middle">
        A8F291C3...
      </Text>
    </group>
  );
}

function BlockchainConnection({ step }: { step: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const isActive = step === 3;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.visible = isActive;
    if (isActive) {
      const progress = (t * 2.0) % 1.0;
      ref.current.position.z = progress * 6;
      (ref.current.material as THREE.MeshStandardMaterial).opacity = Math.sin(progress * Math.PI) * 0.8;
    }
  });

  return (
    <mesh ref={ref} position={[3.5, 0, 0]} visible={false} rotation={[0, Math.PI / 2, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
      <meshStandardMaterial color="#60a5fa" emissive={new THREE.Color('#3b82f6')} emissiveIntensity={2.0} transparent opacity={0.8} />
    </mesh>
  );
}

// ─── Side Panels ──────────────────────────────────────────────────────────────
function SidePanel({ side, step, type }: { side: 1 | -1; step: number; type: 'issuer' | 'hash' }) {
  const isIssuer = type === 'issuer';
  const activateStep = isIssuer ? 1 : 2;
  const isActive = step === activateStep;
  const isDone = step > activateStep;
  const isVisible = step >= activateStep;

  const panelColor = isVisible ? '#162b50' : '#0f172a';
  const textMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', 
    emissive: new THREE.Color(isActive ? '#60a5fa' : '#ffffff'), 
    emissiveIntensity: isActive ? 1.5 : (isDone ? 0.8 : 0.2), 
    transparent: true, 
    opacity: isVisible ? 1 : 0,
  }), [isActive, isDone, isVisible]);

  return (
    <group position={[side * 4.2, 0, 0]}>
      <mesh material={matFrame} castShadow>
        <boxGeometry args={[1.2, 1.8, 0.2]} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[1.0, 1.6, 0.04]} />
        <meshStandardMaterial color={panelColor} roughness={0.5} />
      </mesh>
      <group position={[0, 0, 0.13]}>
        {isIssuer ? (
          <>
            {isVisible && (
              <Text position={[0, 0, 0]} fontSize={0.16} letterSpacing={0.05} material={textMat} anchorX="center" anchorY="middle">
                {isDone ? 'ISSUER ✓' : 'SCANNING...'}
              </Text>
            )}
          </>
        ) : (
          <>
            {isVisible && (
              <Text position={[0, 0.2, 0]} fontSize={0.16} letterSpacing={0.05} material={textMat} anchorX="center" anchorY="middle">
                {step >= 2 ? 'HASH ✓' : ''}
              </Text>
            )}
            {step >= 3 && (
              <Text position={[0, -0.2, 0]} fontSize={0.16} letterSpacing={0.05} material={textMat} anchorX="center" anchorY="middle">
                {isDone ? 'BLOCKCHAIN ✓' : 'MATCHING...'}
              </Text>
            )}
          </>
        )}
      </group>
    </group>
  );
}

// ─── Scanning frame ───────────────────────────────────────────────────────────
function ScanningFrame({ step }: { step: number }) {
  const isScanning = step > 0 && step < 4;
  const scanMesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (scanMesh.current && isScanning) {
      scanMesh.current.position.y = Math.sin(state.clock.elapsedTime * 2.5) * 0.9;
    }
  });

  return (
    <group>
      <mesh material={matPanel} position={[0, 1.5, 0]}>
        <boxGeometry args={[4.2, 0.2, 0.4]} />
      </mesh>
      <mesh material={matPanel} position={[0, -1.5, 0]}>
        <boxGeometry args={[4.2, 0.2, 0.4]} />
      </mesh>
      
      {isScanning && (
        <mesh ref={scanMesh} position={[0, 0, 0.15]}>
          <boxGeometry args={[2.5, 0.015, 0.005]} />
          <meshStandardMaterial color="#3b82f6" emissive={new THREE.Color('#3b82f6')} emissiveIntensity={2.0} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ─── Verification confirmation light — certainty, not excitement ───────────────
// One decisive pulse that decays. Not an explosion. Not a celebration.
function VerifiedConfirmationLight({ step }: { step: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const arrivedAt = useRef<number | null>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    if (step < 4) {
      arrivedAt.current = null;
      lightRef.current.intensity = 0;
      return;
    }
    if (arrivedAt.current === null) arrivedAt.current = t;
    const elapsed = t - arrivedAt.current;
    // Peak at 0.3s (intensity 5), then exponential decay to 1.5 over ~3s
    const peak = Math.min(1, elapsed / 0.3);
    const decay = elapsed > 0.3 ? Math.exp(-(elapsed - 0.3) * 0.8) : 1;
    lightRef.current.intensity = peak * (1.5 + 3.5 * decay);
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 1, 2]}
      color="#a5c8ff"   // cool white-blue: certainty not excitement
      intensity={0}
      distance={14}
      decay={2}
    />
  );
}

// ─── Main VerificationPortal ──────────────────────────────────────────────────
export default function VerificationPortal({ verificationProgress, positionZ = -36 }: VerificationPortalProps) {
  const step = getStep(verificationProgress);

  return (
    <group position={[0, 0, positionZ]}>
      {/* Dedicated local lighting — focused on credential, not entire environment */}
      <ambientLight intensity={0.4} color="#c8d8ff" />
      {/* Main overhead key light */}
      <pointLight position={[0, 3, 2]} color="#ffffff" intensity={step === 4 ? 5.0 : 3.8} distance={16} decay={2} />
      {/* Credential-targeted spot — primary hero illumination */}
      <spotLight
        position={[0, 4, 3]}
        angle={0.4}
        penumbra={0.6}
        intensity={step === 4 ? 9.0 : 7.0}
        color="#ffffff"
        target-position={[0, -1.0, 0]}
        castShadow={false}
      />
      {/* Blue data accent — only during active verification */}
      <pointLight position={[0, 0, 2]} color="#60a5fa" intensity={step === 4 ? 1.0 : 1.2} distance={10} decay={2} />

      {/* VERIFIED: single controlled certainty pulse (not explosion) */}
      <VerifiedConfirmationLight step={step} />

      {/* Scene 02→03 continuity: data signal arrives from blockchain direction */}
      <DataSignalBeam verificationProgress={verificationProgress} />

      <ScanningFrame step={step} />
      <CredentialSilhouette step={step} verificationProgress={verificationProgress} />

      {/* Physical Connections */}
      <IssuerConnection step={step} />
      <HashExtractionConnection step={step} />
      <BlockchainConnection step={step} />

      {/* Minimal Panels */}
      <SidePanel side={-1} step={step} type="issuer" />
      <SidePanel side={1} step={step} type="hash" />
    </group>
  );
}
