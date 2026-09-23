'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrustNetworkProps {
  scrollProgress: number;
  positionZ?: number;
}

const PRIMARY_NODES = [
  new THREE.Vector3(-2.5, -2.0, 0.8),   // STUDENT
  new THREE.Vector3(2.2, 2.4, -0.6),    // UNIVERSITY
  new THREE.Vector3(3.0, -1.2, 1.2),    // EMPLOYER
  new THREE.Vector3(-2.8, 1.8, -1.0),   // AUXILIARY VERIFIER
];

const PARTICLE_COUNT = 300;
const CONNECTION_DISTANCE = 4.0;

export default function TrustNetwork({ scrollProgress, positionZ = -58 }: TrustNetworkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const centerRef = useRef<THREE.Mesh>(null);
  const p0 = useRef<THREE.Mesh>(null);
  const p1 = useRef<THREE.Mesh>(null);
  const p2 = useRef<THREE.Mesh>(null);
  const p3 = useRef<THREE.Mesh>(null);
  const primaryRefs = [p0, p1, p2, p3];
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate a spherical cloud of particles
  const particles = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 18; // from radius 3 out to 21
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }
    return pts;
  }, []);

  const particlePositionsArray = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = particles[i].x;
      arr[i * 3 + 1] = particles[i].y;
      arr[i * 3 + 2] = particles[i].z;
    }
    return arr;
  }, [particles]);

  const connectionGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const center = new THREE.Vector3(0, 0, 0);
    
    // Connect center to primary nodes
    for (let i = 0; i < PRIMARY_NODES.length; i++) {
      points.push(center, PRIMARY_NODES[i]);
    }

    // Connect particles to each other if close
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Connect to primary nodes if close
      PRIMARY_NODES.forEach((primary) => {
        if (particles[i].distanceTo(primary) < 5.0) {
          points.push(particles[i], primary);
        }
      });

      let connections = 0;
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        if (particles[i].distanceTo(particles[j]) < CONNECTION_DISTANCE) {
          points.push(particles[i], particles[j]);
          connections++;
          if (connections > 4) break; // Limit branches per node for clean look
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [particles]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const sp = scrollProgress;

    // Slow cinematic rotation
    if (groupRef.current) {
      const speedMult = Math.max(0.01, 1.0 - Math.pow(sp, 3) * 2);
      groupRef.current.rotation.y = t * 0.03 * speedMult;
      groupRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
      groupRef.current.position.y = Math.sin(t * 0.1) * 0.3;
    }

    // Node opacities driven by scroll
    const centerProgress = Math.max(0, Math.min(1, (sp - 0.75) / 0.06));
    if (centerRef.current) {
      const mat = centerRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = centerProgress;
      mat.emissiveIntensity = 4.0 * centerProgress;
    }

    for (let i = 0; i < PRIMARY_NODES.length; i++) {
      const delay = 0.06 + i * 0.04;
      const nodeProgress = Math.max(0, Math.min(1, (sp - 0.75 - delay) / 0.08));
      if (primaryRefs[i].current) {
        const mat = primaryRefs[i].current!.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.8 * nodeProgress;
        mat.emissiveIntensity = 2.0 * nodeProgress;
      }
    }

    // Fade in network
    const netProgress = Math.max(0, Math.min(1, (sp - 0.78) / 0.12));
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.6 * netProgress;
    }
    if (linesRef.current) {
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = 0.15 * netProgress;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, positionZ]}>
      {/* 1. CENTER NODE (Verified Credential) */}
      <mesh ref={centerRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#60a5fa" emissiveIntensity={0} transparent opacity={0} />
      </mesh>
      
      {/* Core glows */}
      <pointLight position={[0, 0, 0]} color="#ffffff" intensity={3.5 * Math.max(0, Math.min(1, (scrollProgress - 0.75) / 0.06))} distance={12} />
      <pointLight position={[0, 0, 0]} color="#3b82f6" intensity={2.0 * Math.max(0, Math.min(1, (scrollProgress - 0.78) / 0.08))} distance={30} />

      {/* 2. PRIMARY HUB NODES */}
      {PRIMARY_NODES.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Inner core */}
          <mesh ref={primaryRefs[i]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#eff6ff" emissive="#3b82f6" emissiveIntensity={0} transparent opacity={0} />
          </mesh>
          {/* Outer ring */}
          <mesh>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.4 * Math.max(0, Math.min(1, (scrollProgress - 0.78) / 0.08))} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}

      {/* 3. DECENTRALIZED NETWORK CLOUD */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={particlePositionsArray} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#93c5fd" size={0.12} sizeAttenuation transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* 4. NETWORK CONNECTIONS */}
      <lineSegments ref={linesRef} geometry={connectionGeometry}>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}