'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createDissolveGeometry, dissolveVertexShader, dissolveFragmentShader } from '@/shaders/credentialShader';

interface ParticleSystemProps {
  dissolveProgress: number;
  count?: number;
}

export default function ParticleSystem({ dissolveProgress, count = 3000 }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => createDissolveGeometry(count), [count]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: dissolveVertexShader,
    fragmentShader: dissolveFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uProgress.value = dissolveProgress;
    }
  });

  if (dissolveProgress < 0.01) return null;

  return (
    <points ref={pointsRef} geometry={geometry} material={material}>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        vertexShader={dissolveVertexShader}
        fragmentShader={dissolveFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: dissolveProgress },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Ambient floating particles for environment
export function AmbientParticles({ count = 800, range = 20 }: { count?: number; range?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [{ positions, sizes }] = useState(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * range;
      positions[i * 3 + 1] = (Math.random() - 0.5) * range * 0.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * range;
      sizes[i] = Math.random() * 2 + 0.5;
    }
    return { positions, sizes };
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#3b82f6"
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.25}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Hash/data stream particles for Scene 02
export function HashParticles({ count = 1500, centerZ = -15 }: { count?: number; centerZ?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [geo] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = centerZ + (Math.random() - 0.5) * 12;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        color="#3b82f6"
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
