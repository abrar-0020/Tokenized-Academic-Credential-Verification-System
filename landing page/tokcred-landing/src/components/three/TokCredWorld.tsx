'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import CameraController from './CameraController';
import CredentialMesh from './CredentialMesh';
import BlockchainStructure from './BlockchainStructure';
import BlockRecord from './BlockRecord';
import VerificationPortal from './VerificationPortal';
import TrustNetwork from './TrustNetwork';
import ParticleSystem, { AmbientParticles, HashParticles } from './ParticleSystem';

interface TokCredWorldProps {
  scrollProgress: number;
  scrollProgressRef: React.MutableRefObject<number>;
  mouseX: number;
  mouseY: number;
  isMobile: boolean;
  prefersReducedMotion: boolean;
}

// Architectural environment — digital archive space
function ArchitecturalEnvironment() {
  return (
    <group>
      {/* Subtle floor grid/plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <planeGeometry args={[120, 150]} />
        <meshStandardMaterial 
          color="#030305" 
          roughness={0.15} 
          metalness={0.8}
        />
      </mesh>
      
      {/* Floor accent grid */}
      <gridHelper
        args={[120, 60, '#0d1a3a', '#050a14']}
        position={[0, -3.99, 0]}
      />

      {/* BACKGROUND: Distant Walls and Columns — extended to full scene depth */}
      <group position={[0, 0, -80]}>
        <mesh position={[0, 4, -10]} receiveShadow>
          <planeGeometry args={[120, 60]} />
          <meshStandardMaterial color="#020204" roughness={0.9} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={`bg-col-${i}`} position={[-44 + i * 8, 4, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 30, 4]} />
            <meshStandardMaterial color="#050508" roughness={0.8} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* MIDGROUND: Translucent Data Planes and Architectural Frames — runs entire length */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={`mid-arch-${i}`} position={[0, 0, -10 - i * 6]}>
          <mesh position={[-14, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 18, 1.5]} />
            <meshStandardMaterial color="#0a0a0f" roughness={0.7} metalness={0.3} />
          </mesh>
          <mesh position={[14, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 18, 1.5]} />
            <meshStandardMaterial color="#0a0a0f" roughness={0.7} metalness={0.3} />
          </mesh>
          <mesh position={[0, 10, 0]} castShadow receiveShadow>
            <boxGeometry args={[28, 0.5, 1.5]} />
            <meshStandardMaterial color="#0a0a0f" roughness={0.5} metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* FOREGROUND: Parallax Silhouette Elements — Assymetrical heights */}
      <mesh position={[-6, -2, 6]}>
        <boxGeometry args={[1.5, 12, 1.5]} />
        <meshStandardMaterial color="#030305" roughness={0.9} />
      </mesh>
      <mesh position={[7, -1, 4]}>
        <boxGeometry args={[2, 16, 2]} />
        <meshStandardMaterial color="#030305" roughness={0.9} />
      </mesh>
      <mesh position={[-8, 5, 2]}>
        <boxGeometry args={[1, 14, 1]} />
        <meshStandardMaterial color="#030305" roughness={0.9} />
      </mesh>
    </group>
  );
}

function SceneLighting({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ camera }) => {
    const scrollProgress = scrollProgressRef.current;
    
    // Rim light subtly follows the camera but stays slightly behind and above objects
    if (rimLightRef.current) {
      rimLightRef.current.position.set(
        camera.position.x - 2,
        camera.position.y + 5,
        camera.position.z - 3
      );
    }

    if (keyLightRef.current) {
      // Dynamic lighting intensity during verification climax (scroll 0.6 to 0.8)
      const isVerification = scrollProgress > 0.6 && scrollProgress < 0.82;
      const verifyBoost = isVerification
        ? Math.max(0, (scrollProgress - 0.6) / 0.22) * Math.max(0, 1 - (scrollProgress - 0.72) / 0.1)
        : 0;
      keyLightRef.current.intensity = 2.5 + verifyBoost * 3;
    }
  });

  return (
    <>
      {/* Global low-level fill so nothing is pitch black from behind */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Strong, cool key light to define form and cast sharp shadows */}
      <directionalLight
        ref={keyLightRef}
        position={[8, 10, 5]}
        intensity={2.5}
        color="#e0e7ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-near={0.1}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
      />

      {/* Softer, darker blue fill light from the opposite side */}
      <directionalLight
        ref={fillLightRef}
        position={[-10, 2, -5]}
        intensity={0.8}
        color="#1e3a8a"
      />

      {/* Dynamic rim light to separate objects from the dark background */}
      <pointLight
        ref={rimLightRef}
        color="#60a5fa"
        intensity={2}
        distance={25}
        decay={2}
      />
      
      {/* Dedicated spotlight for Scene 01 Credential */}
      <spotLight
        position={[-3, 4, 3]}
        angle={0.6}
        penumbra={0.8}
        intensity={3}
        color="#ffffff"
        target-position={[1.5, 0, 0]}
        castShadow
      />
    </>
  );
}

export default function TokCredWorld({
  scrollProgress,
  scrollProgressRef,
  mouseX,
  mouseY,
  isMobile,
  prefersReducedMotion,
}: TokCredWorldProps) {
  // Derive per-scene progress values
  let dissolveProgress = Math.max(0, Math.min(1, (scrollProgress - 0.25) / 0.15));
  // Re-assemble the credential behind the camera once we are safely past it!
  if (scrollProgress > 0.55) {
    dissolveProgress = Math.max(0, 1 - (scrollProgress - 0.55) / 0.15); // Dissolves back to 0
  }
  const blockchainProgress = Math.max(0, Math.min(1, (scrollProgress - 0.40) / 0.20));
  const verificationProgress = Math.max(0, Math.min(1, (scrollProgress - 0.60) / 0.20));
  const trustProgress = Math.max(0, Math.min(1, (scrollProgress - 0.80) / 0.20));

  return (
    <Canvas
      shadows
      dpr={[1, isMobile ? 1 : 1.5]}
      camera={{ position: [0, 0.2, 11], fov: 50, near: 0.1, far: 350 }}
      style={{ background: '#050508' }}
      gl={{
        antialias: !isMobile,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      onCreated={({ scene }) => {
        // Use linear fog for better control over depth visibility
        scene.fog = new THREE.Fog('#030305', 5, 50);
      }}
    >
      <SceneLighting scrollProgressRef={scrollProgressRef} />

      <Suspense fallback={null}>
        <CameraController 
          scrollProgressRef={scrollProgressRef} 
          prefersReducedMotion={prefersReducedMotion} 
          mouseX={mouseX} 
          mouseY={mouseY} 
        />

        {/* SCENE 01 — Credential */}
        <CredentialMesh
          dissolveProgress={dissolveProgress}
          mouseX={mouseX}
          mouseY={mouseY}
        />

        {/* Dissolve particles */}
        <ParticleSystem
          dissolveProgress={dissolveProgress}
          count={isMobile ? 2500 : 8000}
        />

        {/* Environment architecture */}
        <ArchitecturalEnvironment />

        {/* Ambient floating particles */}
        <AmbientParticles count={isMobile ? 300 : 800} range={20} />

        {/* SCENE 02 — Blockchain */}
        <BlockchainStructure
          scrollProgress={blockchainProgress}
          positionZ={-18}
        />
        
        <BlockRecord
          blockchainProgress={blockchainProgress}
          positionZ={-30}
        />

        {/* Hash particles around blockchain */}
        <HashParticles count={isMobile ? 500 : 1500} centerZ={-18} />

        {/* SCENE 03 — Verification Portal */}
        <VerificationPortal
          verificationProgress={verificationProgress}
          positionZ={-36}
        />

        {/* SCENE 04 — Trust Network */}
        <TrustNetwork
          scrollProgress={scrollProgress}
          positionZ={-58}
        />

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  );
}
