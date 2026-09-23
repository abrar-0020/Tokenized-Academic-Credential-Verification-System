'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BlockRecordProps {
  blockchainProgress: number;
  positionZ?: number;
}

const matSlab = new THREE.MeshStandardMaterial({ color: '#1a1a24', roughness: 0.8, metalness: 0.2 });
const matFace = new THREE.MeshStandardMaterial({ color: '#222230', roughness: 0.7, metalness: 0.3 });
const matTrim = new THREE.MeshStandardMaterial({ color: '#b89020', roughness: 0.3, metalness: 0.6 });

export default function BlockRecord({ blockchainProgress, positionZ = -30 }: BlockRecordProps) {
  const groupRef = useRef<THREE.Group>(null);
  const anchorGlowRef = useRef<THREE.PointLight>(null);
  const hashEnterRef = useRef<THREE.Mesh>(null);

  // Hash entrance animation: progress 0.3 ? 0.7 = hash fills in
  const hashOpacity = Math.max(0, Math.min(1, (blockchainProgress - 0.3) / 0.4));
  // Anchored state: progress > 0.65
  const isAnchored = blockchainProgress > 0.65;

  const anchorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3b82f6',
    emissive: new THREE.Color('#3b82f6'),
    emissiveIntensity: isAnchored ? 1.2 : 0.2,
    transparent: true,
    opacity: isAnchored ? 1 : 0.4,
  }), [isAnchored]);

  const hashMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#60a5fa',
    emissive: new THREE.Color('#3b82f6'),
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: hashOpacity,
  }), [hashOpacity]);

  const labelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#374151',
    transparent: true,
    opacity: Math.max(0, Math.min(1, (blockchainProgress - 0.1) / 0.3)),
  }), [blockchainProgress]);

  const blockNumMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    transparent: true,
    opacity: Math.max(0, Math.min(1, (blockchainProgress - 0.1) / 0.3)),
  }), [blockchainProgress]);

  const dividerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e3a8a',
    emissive: new THREE.Color('#1e3a8a'),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: Math.max(0, Math.min(1, (blockchainProgress - 0.15) / 0.3)) * 0.6,
  }), [blockchainProgress]);

  // Gold trim material (reused across trim meshes)
  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d4af37', // Brighter gold
    emissive: new THREE.Color('#d4af37'),
    emissiveIntensity: 0.1,
    roughness: 0.4,
    metalness: 0.5,
    transparent: true,
    opacity: Math.max(0, Math.min(1, (blockchainProgress - 0.05) / 0.25)),
  }), [blockchainProgress]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (anchorGlowRef.current) {
      anchorGlowRef.current.intensity = isAnchored
        ? 1.5 + Math.sin(t * 0.8) * 0.3
        : 0.2;
    }
    if (groupRef.current) {
      // Very subtle breathing
      groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.03;
    }
  });

  const slabW = 3.2;
  const slabH = 4.5;
  const slabD = 0.55;

  return (
    <group ref={groupRef} position={[0, 0, positionZ]}>
      {/* Localized fill light to ensure block is visible from the front */}
      <pointLight position={[0, 2, 4]} intensity={2.0} color="#c8d8ff" distance={15} decay={2} />
      
      {/* Backlight so the block remains visible when the user looks back from deep in the tunnel */}
      <pointLight position={[0, 2, -4]} intensity={1.5} color="#c8d8ff" distance={15} decay={2} />

      {/* Main physical slab body */}
      <mesh material={matSlab} castShadow receiveShadow>
        <boxGeometry args={[slabW, slabH, slabD]} />
      </mesh>

      {/* Inset face panel — slightly recessed */}
      <mesh material={matFace} position={[0, 0, slabD / 2 + 0.01]}>
        <boxGeometry args={[slabW - 0.3, slabH - 0.3, 0.04]} />
      </mesh>

      {/* Gold/brass corner trim pieces — physical embossed look */}
      {/* Top-left corner */}
      <mesh material={trimMat} position={[-(slabW / 2) + 0.08, slabH / 2 - 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.5, 0.04, 0.02]} />
      </mesh>
      <mesh material={trimMat} position={[-(slabW / 2) + 0.08, slabH / 2 - 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.04, 0.5, 0.02]} />
      </mesh>
      {/* Top-right corner */}
      <mesh material={trimMat} position={[slabW / 2 - 0.08, slabH / 2 - 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.5, 0.04, 0.02]} />
      </mesh>
      <mesh material={trimMat} position={[slabW / 2 - 0.08, slabH / 2 - 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.04, 0.5, 0.02]} />
      </mesh>
      {/* Bottom-left corner */}
      <mesh material={trimMat} position={[-(slabW / 2) + 0.08, -(slabH / 2) + 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.5, 0.04, 0.02]} />
      </mesh>
      <mesh material={trimMat} position={[-(slabW / 2) + 0.08, -(slabH / 2) + 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.04, 0.5, 0.02]} />
      </mesh>
      {/* Bottom-right corner */}
      <mesh material={trimMat} position={[slabW / 2 - 0.08, -(slabH / 2) + 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.5, 0.04, 0.02]} />
      </mesh>
      <mesh material={trimMat} position={[slabW / 2 - 0.08, -(slabH / 2) + 0.08, slabD / 2 + 0.02]}>
        <boxGeometry args={[0.04, 0.5, 0.02]} />
      </mesh>

      {/* Content — positioned on the face of the slab */}
      <group position={[0, 0, slabD / 2 + 0.06]}>

        {/* BLOCK #184,291 */}
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.14}
          letterSpacing={0.12}
          material={blockNumMat}
          anchorX="center"
          anchorY="middle"
        >
          BLOCK #184,291
        </Text>

        {/* Divider 1 */}
        <mesh position={[0, 1.3, 0]} material={dividerMat}>
          <boxGeometry args={[2.5, 0.005, 0.01]} />
        </mesh>

        {/* CREDENTIAL HASH label */}
        <Text
          position={[0, 1.1, 0]}
          fontSize={0.1}
          letterSpacing={0.14}
          material={labelMat}
          anchorX="center"
          anchorY="middle"
        >
          CREDENTIAL HASH
        </Text>

        {/* The hash value — fades in as blockchainProgress increases */}
        <Text
          position={[0, 0.82, 0]}
          fontSize={0.145}
          letterSpacing={0.05}
          material={hashMat}
          anchorX="center"
          anchorY="middle"
        >
          A8F291C3D7E2...
        </Text>

        {/* Divider 2 */}
        <mesh position={[0, 0.55, 0]} material={dividerMat}>
          <boxGeometry args={[2.5, 0.005, 0.01]} />
        </mesh>

        {/* PREVIOUS HASH label */}
        <Text
          position={[0, 0.36, 0]}
          fontSize={0.1}
          letterSpacing={0.14}
          material={labelMat}
          anchorX="center"
          anchorY="middle"
        >
          PREVIOUS HASH
        </Text>

        {/* Previous hash value */}
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.12}
          letterSpacing={0.04}
          material={labelMat}
          anchorX="center"
          anchorY="middle"
        >
          7D82E91A4F20...
        </Text>

        {/* Divider 3 */}
        <mesh position={[0, -0.2, 0]} material={dividerMat}>
          <boxGeometry args={[2.5, 0.005, 0.01]} />
        </mesh>

        {/* STATUS */}
        <Text
          position={[0, -0.44, 0]}
          fontSize={0.1}
          letterSpacing={0.14}
          material={labelMat}
          anchorX="center"
          anchorY="middle"
        >
          STATUS
        </Text>

        {/* ANCHORED ✓ — main status indicator */}
        <Text
          position={[0, -0.72, 0]}
          fontSize={0.22}
          letterSpacing={0.1}
          material={anchorMat}
          anchorX="center"
          anchorY="middle"
        >
          ANCHORED ✓
        </Text>

        {/* Divider 4 */}
        <mesh position={[0, -1.05, 0]} material={dividerMat}>
          <boxGeometry args={[2.5, 0.005, 0.01]} />
        </mesh>

        {/* Timestamp */}
        <Text
          position={[0, -1.28, 0]}
          fontSize={0.09}
          letterSpacing={0.08}
          material={labelMat}
          anchorX="center"
          anchorY="middle"
        >
          TIMESTAMP: 2026-10-15
        </Text>

        {/* Hash entrance: data ray arrives from FRONT (z+, credential direction) */}
        {hashOpacity > 0.01 && (
          <mesh position={[0, 0.82, 1.5 - hashOpacity * 1.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, hashOpacity * 2.5, 8]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive={new THREE.Color('#3b82f6')}
              emissiveIntensity={4.0}
              transparent
              opacity={hashOpacity * 0.75}
            />
          </mesh>
        )}
        {/* Credential ID — connects BlockRecord to Scene 01 document */}
        <Text
          position={[0, -1.55, 0]}
          fontSize={0.075}
          letterSpacing={0.12}
          material={labelMat}
          anchorX="center"
          anchorY="middle"
        >
          CREDENTIAL TC-2026-001284
        </Text>
      </group>

      {/* Glow light for the anchored state */}
      <pointLight
        ref={anchorGlowRef}
        position={[0, 0, 1.5]}
        color="#3b82f6"
        intensity={0.2}
        distance={8}
        decay={2}
      />

      {/* Structural side bolts — physical embossed detail */}
      {[-1.55, 1.55].map((x, i) => (
        <group key={i} position={[x, 0, slabD / 2 + 0.01]}>
          {[-1.8, 0, 1.8].map((y, j) => (
            <mesh key={j} material={matTrim} position={[0, y, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.04, 8]} />
            </mesh>
          ))}
        </group>
      ))}

    </group>
  );
}
