'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { credentialVertexShader, credentialFragmentShader } from '@/shaders/credentialShader';
import { RoundedBox, Text } from '@react-three/drei';

interface CredentialMeshProps {
  dissolveProgress: number;
  mouseX: number;
  mouseY: number;
}

export default function CredentialMesh({ dissolveProgress, mouseX, mouseY }: CredentialMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  const certW = 4.8;
  const certH = 3.2;
  const certD = 0.18;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAccentColor: { value: new THREE.Color('#3b82f6') },
    uCameraPosition: { value: new THREE.Vector3() },
    uHolographicStrength: { value: 1.0 },
    uOpacity: { value: 1.0 },
  }), []);

  const paperMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#f4f1ea',
    roughness: 0.85,
    metalness: 0.05,
    clearcoat: 0.05,
    clearcoatRoughness: 0.9,
    transparent: true,
  }), []);

  const goldMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#d4af37',
    roughness: 0.2,
    metalness: 1.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    transparent: true,
  }), []);

  const holoMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.05,
    metalness: 0.9,
    iridescence: 1.0,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [100, 400],
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    transparent: true,
  }), []);

  const textMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a24',
    roughness: 0.6,
    metalness: 0.2,
    transparent: true,
  }), []);

  const mutedTextMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6b7280',
    roughness: 0.6,
    metalness: 0.1,
    transparent: true,
  }), []);

  const pendingBgMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a0c00',
    roughness: 0.9,
    transparent: true,
  }), []);

  const pendingBorderMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#b07c28',
    emissive: new THREE.Color('#b07c28'),
    emissiveIntensity: 0.6,
    transparent: true,
  }), []);

  const pendingTextMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f0a832',
    emissive: new THREE.Color('#f0a832'),
    emissiveIntensity: 0.2,
    transparent: true,
  }), []);

  const dividerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c9a84c',
    transparent: true,
    opacity: 0.35,
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uCameraPosition.value.copy(camera.position);
      materialRef.current.uniforms.uHolographicStrength.value = 1.0 - dissolveProgress;
    }

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.04;
      groupRef.current.rotation.x = mouseY * 0.03;
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.01 + mouseX * 0.05;

      if (dissolveProgress > 0) {
        const approach = Math.min(1.0, dissolveProgress * 2.0);
        groupRef.current.position.z = approach * 2.5;

        const activeFloatPhase = Math.max(0, (dissolveProgress - 0.1) * 1.5);
        const floatY = Math.sin(t * 10) * 0.02 * activeFloatPhase;
        groupRef.current.rotation.z = floatY * 0.5;
        groupRef.current.position.x = 1.5 + floatY * 0.5;
        groupRef.current.position.y += floatY;

        const fadeOpacity = Math.max(0, 1.0 - dissolveProgress * 4.0);
        paperMaterial.opacity = fadeOpacity;
        goldMaterial.opacity = fadeOpacity;
        holoMaterial.opacity = fadeOpacity;
        textMaterial.opacity = fadeOpacity;
        mutedTextMaterial.opacity = fadeOpacity;
        pendingBgMaterial.opacity = fadeOpacity;
        pendingBorderMaterial.opacity = fadeOpacity;
        pendingTextMaterial.opacity = fadeOpacity;
        dividerMaterial.opacity = fadeOpacity * 0.35;
        if (materialRef.current) materialRef.current.uniforms.uOpacity.value = fadeOpacity;
      } else {
        groupRef.current.position.z = 0;
        groupRef.current.rotation.z = 0;
        groupRef.current.position.x = 1.5;
        paperMaterial.opacity = 1;
        goldMaterial.opacity = 1;
        holoMaterial.opacity = 1;
        textMaterial.opacity = 1;
        mutedTextMaterial.opacity = 1;
        pendingBgMaterial.opacity = 1;
        pendingBorderMaterial.opacity = 1;
        pendingTextMaterial.opacity = 1;
        dividerMaterial.opacity = 0.35;
        if (materialRef.current) materialRef.current.uniforms.uOpacity.value = 1.0;
      }
    }
  });

  const visible = dissolveProgress < 0.95;

  return (
    <group ref={groupRef} visible={visible}>
      <RoundedBox args={[certW, certH, certD]} radius={0.015} smoothness={4} castShadow receiveShadow>
        <primitive object={paperMaterial} attach="material-0" />
        <primitive object={paperMaterial} attach="material-1" />
        <primitive object={paperMaterial} attach="material-2" />
        <primitive object={paperMaterial} attach="material-3" />
        <shaderMaterial
          ref={materialRef}
          attach="material-4"
          vertexShader={credentialVertexShader}
          fragmentShader={credentialFragmentShader}
          uniforms={uniforms}
          transparent={true}
        />
        <primitive object={paperMaterial} attach="material-5" />
      </RoundedBox>

      <group position={[0, 0, certD / 2 + 0.001]} scale={Math.max(0.001, 1.0 - dissolveProgress * 2.5)}>

        {/* Gold border frame */}
        <mesh position={[0, (certH - 0.25) / 2, 0.002]} material={goldMaterial} castShadow>
          <boxGeometry args={[certW - 0.25, 0.01, 0.002]} />
        </mesh>
        <mesh position={[0, -(certH - 0.25) / 2, 0.002]} material={goldMaterial} castShadow>
          <boxGeometry args={[certW - 0.25, 0.01, 0.002]} />
        </mesh>
        <mesh position={[-(certW - 0.25) / 2, 0, 0.002]} material={goldMaterial} castShadow>
          <boxGeometry args={[0.01, certH - 0.25, 0.002]} />
        </mesh>
        <mesh position={[(certW - 0.25) / 2, 0, 0.002]} material={goldMaterial} castShadow>
          <boxGeometry args={[0.01, certH - 0.25, 0.002]} />
        </mesh>

        {/* University seal */}
        <group position={[0, 0.88, 0.005]}>
          <mesh material={goldMaterial} castShadow>
            <torusGeometry args={[0.24, 0.016, 16, 64]} />
          </mesh>
          <mesh material={goldMaterial}>
            <torusGeometry args={[0.16, 0.007, 16, 64]} />
          </mesh>
          <mesh receiveShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.004, 64]} />
            <meshPhysicalMaterial color="#ece9e4" roughness={0.9} clearcoat={0.1} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]} material={goldMaterial} position={[0, 0, 0.003]}>
              <boxGeometry args={[0.14, 0.008, 0.004]} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.005]} material={goldMaterial}>
            <cylinderGeometry args={[0.05, 0.05, 0.004, 32]} />
          </mesh>
        </group>

        {/* Divider below seal */}
        <mesh position={[0, 0.56, 0.002]} material={dividerMaterial}>
          <boxGeometry args={[1.8, 0.005, 0.001]} />
        </mesh>

        {/* Typography */}
        <group position={[0, 0.15, 0.002]}>
          <Text
            position={[0, 0.26, 0]}
            fontSize={0.085}
            letterSpacing={0.22}
            material={mutedTextMaterial}
            anchorX="center"
            anchorY="middle"
          >
            EXAMPLE UNIVERSITY
          </Text>

          <Text
            position={[0, -0.06, 0]}
            fontSize={0.27}
            letterSpacing={0.06}
            material={textMaterial}
            anchorX="center"
            anchorY="middle"
          >
            BACHELOR OF TECHNOLOGY
          </Text>

          <Text
            position={[0, -0.38, 0]}
            fontSize={0.2}
            letterSpacing={0.1}
            material={textMaterial}
            anchorX="center"
            anchorY="middle"
          >
            ALEX CHEN
          </Text>

          <Text
            position={[0, -0.61, 0]}
            fontSize={0.072}
            letterSpacing={0.14}
            material={mutedTextMaterial}
            anchorX="center"
            anchorY="middle"
          >
            AWARDED WITH HIGHEST HONORS
          </Text>

          {/* Footer divider */}
          <mesh position={[0, -0.80, 0]} material={dividerMaterial}>
            <boxGeometry args={[certW - 0.6, 0.004, 0.001]} />
          </mesh>

          {/* Credential ID */}
          <Text position={[-1.1, -0.94, 0]} fontSize={0.058} letterSpacing={0.08} material={mutedTextMaterial} anchorX="left" anchorY="middle">
            CREDENTIAL ID
          </Text>
          <Text position={[-1.1, -1.08, 0]} fontSize={0.085} letterSpacing={0.04} material={textMaterial} anchorX="left" anchorY="middle">
            TC-2026-001284
          </Text>

          {/* Issue Date */}
          <Text position={[1.1, -0.94, 0]} fontSize={0.058} letterSpacing={0.08} material={mutedTextMaterial} anchorX="right" anchorY="middle">
            ISSUE DATE
          </Text>
          <Text position={[1.1, -1.08, 0]} fontSize={0.085} letterSpacing={0.04} material={textMaterial} anchorX="right" anchorY="middle">
            OCTOBER 15, 2026
          </Text>

          {/* Digital signature */}
          <Text
            position={[0, -1.26, 0]}
            fontSize={0.05}
            letterSpacing={0.04}
            material={mutedTextMaterial}
            anchorX="center"
            anchorY="middle"
          >
            SIG: TC·A8F291C3D7E24B6F9A...
          </Text>
        </group>

        {/* PENDING VERIFICATION status badge */}
        <group position={[0, -(certH / 2) + 0.15, 0.003]}>
          <mesh material={pendingBgMaterial}>
            <boxGeometry args={[certW - 0.26, 0.22, 0.002]} />
          </mesh>
          <mesh position={[0, 0.11, 0.001]} material={pendingBorderMaterial}>
            <boxGeometry args={[certW - 0.26, 0.006, 0.001]} />
          </mesh>
          <mesh position={[-0.55, 0, 0.002]}>
            <circleGeometry args={[0.024, 16]} />
            <meshStandardMaterial color="#f0a832" emissive={new THREE.Color('#f0a832')} emissiveIntensity={0.8} />
          </mesh>
          <Text
            position={[0.08, 0, 0.003]}
            fontSize={0.07}
            letterSpacing={0.2}
            material={pendingTextMaterial}
            anchorX="center"
            anchorY="middle"
          >
            PENDING VERIFICATION
          </Text>
        </group>

        {/* Holographic security strip */}
        <mesh position={[certW / 2 - 0.44, 0, 0.003]} material={holoMaterial} castShadow>
          <boxGeometry args={[0.22, certH - 0.5, 0.002]} />
        </mesh>
      </group>
    </group>
  );
}
