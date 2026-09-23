'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlockchainStructureProps {
  scrollProgress: number;
  positionZ?: number;
}

// ─── Material Palette ───────────────────────────────────────────────────────
// 90% dark neutral · 10% blue as light/seam only
const C_STRUCTURE   = '#0c0c10';   // darkest — main structural mass
const C_PANEL       = '#131318';   // mid — wall panels and secondary surfaces
const C_SURFACE     = '#1c1c24';   // light — surface variation, top faces
const C_SEAM        = '#1e3a8a';   // blue — only for illuminated seams
const C_ACTIVE      = '#2563eb';   // blue — only for active data pulses

// ─── Shared materials (created once) ────────────────────────────────────────
const matStructure = new THREE.MeshStandardMaterial({ color: C_STRUCTURE, roughness: 0.95, metalness: 0.05 });
const matPanel     = new THREE.MeshStandardMaterial({ color: C_PANEL,     roughness: 0.85, metalness: 0.25 });
const matSurface   = new THREE.MeshStandardMaterial({ color: C_SURFACE,   roughness: 0.7,  metalness: 0.45 });
const matSeam      = new THREE.MeshStandardMaterial({ color: C_SEAM, emissive: new THREE.Color(C_SEAM), emissiveIntensity: 0.4, roughness: 0.3 });
const matSeamDim   = new THREE.MeshStandardMaterial({ color: C_SEAM, emissive: new THREE.Color(C_SEAM), emissiveIntensity: 0.08, roughness: 0.5 });

// ─── Floor Data Pulse ────────────────────────────────────────────────────────
function FloorPulse({ corridorLength }: { corridorLength: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const progressRef = useRef(0);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    progressRef.current = (t * 0.18) % 1;
    const z = corridorLength * 0.5 - progressRef.current * corridorLength;
    lightRef.current.position.set(0, -3.2, z);
    lightRef.current.intensity = 0.8 + Math.sin(t * 3) * 0.2;
  });

  return (
    <pointLight ref={lightRef} color={C_ACTIVE} intensity={0.8} distance={8} decay={2} />
  );
}

// ─── Ceiling Truss — hand-crafted, never repeated ────────────────────────────
function CeilingTruss({ z, width, depth, yOffset = 0, angle = 0 }: {
  z: number; width: number; depth: number; yOffset?: number; angle?: number;
}) {
  return (
    <group position={[0, 9 + yOffset, z]} rotation={[0, angle, 0]}>
      {/* Main horizontal beam */}
      <mesh material={matStructure} castShadow>
        <boxGeometry args={[width, 0.6, depth]} />
      </mesh>
      {/* Lower chord */}
      <mesh material={matPanel} position={[0, -0.6, 0]}>
        <boxGeometry args={[width - 2, 0.25, depth * 0.6]} />
      </mesh>
      {/* Diagonal web members — left */}
      <mesh material={matSurface} position={[-width * 0.28, -0.3, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.2, 1.2, depth * 0.5]} />
      </mesh>
      {/* Diagonal web members — right */}
      <mesh material={matSurface} position={[width * 0.28, -0.3, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.2, 1.2, depth * 0.5]} />
      </mesh>
      {/* Thin seam strip on bottom edge */}
      <mesh material={matSeamDim} position={[0, -0.73, 0]}>
        <boxGeometry args={[width, 0.03, depth * 0.62]} />
      </mesh>
    </group>
  );
}

// ─── Wall Panel Assembly — asymmetric, varied ────────────────────────────────
function WallPanelLeft({ z, height, depth, zOffset = 0 }: {
  z: number; height: number; depth: number; zOffset?: number;
}) {
  return (
    <group position={[-9.5, height / 2 - 3, z + zOffset]}>
      {/* Primary structural pillar */}
      <mesh material={matStructure} castShadow receiveShadow>
        <boxGeometry args={[1.8, height, depth]} />
      </mesh>
      {/* Recessed panel inset */}
      <mesh material={matPanel} position={[0.7, 0, 0]}>
        <boxGeometry args={[0.4, height - 2, depth - 0.5]} />
      </mesh>
      {/* Thin illuminated seam — vertical */}
      <mesh material={matSeam} position={[0.92, 0, 0]}>
        <boxGeometry args={[0.04, height - 0.5, 0.08]} />
      </mesh>
    </group>
  );
}

function WallPanelRight({ z, height, depth, zOffset = 0 }: {
  z: number; height: number; depth: number; zOffset?: number;
}) {
  return (
    <group position={[9.5, height / 2 - 3, z + zOffset]}>
      {/* Primary structural pillar */}
      <mesh material={matStructure} castShadow receiveShadow>
        <boxGeometry args={[1.8, height, depth]} />
      </mesh>
      {/* Recessed panel inset */}
      <mesh material={matPanel} position={[-0.7, 0, 0]}>
        <boxGeometry args={[0.4, height - 2, depth - 0.5]} />
      </mesh>
      {/* Thin illuminated seam — vertical */}
      <mesh material={matSeam} position={[-0.92, 0, 0]}>
        <boxGeometry args={[0.04, height - 0.5, 0.08]} />
      </mesh>
    </group>
  );
}

// ─── Entry Gateway ───────────────────────────────────────────────────────────
function Gateway({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      {/* Massive archway frame */}
      <mesh material={matStructure} position={[-7.5, 3, 0]} castShadow>
        <boxGeometry args={[4, 15, 4]} />
      </mesh>
      <mesh material={matStructure} position={[7.5, 3, 0]} castShadow>
        <boxGeometry args={[4, 15, 4]} />
      </mesh>
      <mesh material={matPanel} position={[0, 9.5, 0]} castShadow>
        <boxGeometry args={[19, 2, 4]} />
      </mesh>
      {/* Gateway seams */}
      <mesh material={matSeamDim} position={[-5.4, 3, 2]}>
        <boxGeometry args={[0.05, 12, 0.1]} />
      </mesh>
      <mesh material={matSeamDim} position={[5.4, 3, 2]}>
        <boxGeometry args={[0.05, 12, 0.1]} />
      </mesh>
    </group>
  );
}

// ─── Data Chamber ────────────────────────────────────────────────────────────
function DataChamber({ z }: { z: number }) {
  // A wide circular/octagonal breakout space
  return (
    <group position={[0, 0, z]}>
      {/* Outer wide walls */}
      <mesh material={matStructure} position={[-16, 4, 0]} castShadow>
        <boxGeometry args={[2, 16, 12]} />
      </mesh>
      <mesh material={matStructure} position={[16, 4, 0]} castShadow>
        <boxGeometry args={[2, 16, 12]} />
      </mesh>
      
      {/* Angled connecting walls */}
      <mesh material={matPanel} position={[-12, 4, 9]} rotation={[0, -Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1, 14, 8]} />
      </mesh>
      <mesh material={matPanel} position={[12, 4, 9]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1, 14, 8]} />
      </mesh>
      <mesh material={matPanel} position={[-12, 4, -9]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1, 14, 8]} />
      </mesh>
      <mesh material={matPanel} position={[12, 4, -9]} rotation={[0, -Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1, 14, 8]} />
      </mesh>
      
      {/* Central data core pillar (faded into floor) */}
      <mesh material={matPanel} position={[0, -1, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 6, 16]} />
      </mesh>
      <mesh material={matSeam} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.52, 1.52, 0.2, 16]} />
      </mesh>
    </group>
  );
}

// ─── Tapering Approach ───────────────────────────────────────────────────────
function TaperingApproach({ zStart, length }: { zStart: number, length: number }) {
  return (
    <group position={[0, 0, zStart - length / 2]}>
      {/* Left tapering wall */}
      <mesh material={matStructure} position={[-8, 3, 0]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[2, 15, length]} />
      </mesh>
      {/* Right tapering wall */}
      <mesh material={matStructure} position={[8, 3, 0]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[2, 15, length]} />
      </mesh>
      {/* Dropping ceiling */}
      <mesh material={matPanel} position={[0, 8.5, 0]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[16, 1, length]} />
      </mesh>
    </group>
  );
}

// ─── Data Panel — embedded in wall, minimal blue accent ──────────────────────
function DataPanel({ x, y, z, w, h, active }: {
  x: number; y: number; z: number; w: number; h: number; active: boolean;
}) {
  return (
    <group position={[x, y, z]}>
      {/* Recessed housing */}
      <mesh material={matPanel} receiveShadow>
        <boxGeometry args={[w, h, 0.15]} />
      </mesh>
      {/* Recessed face */}
      <mesh material={matStructure} position={[0, 0, 0.06]}>
        <boxGeometry args={[w - 0.2, h - 0.2, 0.05]} />
      </mesh>
      {/* Active seam border — only lights when active */}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[w, 0.04, 0.02]} />
        <meshStandardMaterial
          color={C_SEAM}
          emissive={new THREE.Color(C_SEAM)}
          emissiveIntensity={active ? 0.8 : 0.05}
        />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[0.04, h, 0.02]} />
        <meshStandardMaterial
          color={C_SEAM}
          emissive={new THREE.Color(C_SEAM)}
          emissiveIntensity={active ? 0.8 : 0.05}
        />
      </mesh>
    </group>
  );
}

// ─── Overhead Cable Rack ─────────────────────────────────────────────────────
function CableRack({ zStart, zEnd, xOffset }: { zStart: number; zEnd: number; xOffset: number }) {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3(xOffset, 7.5, zStart),
      new THREE.Vector3(xOffset, 7.2, (zStart + zEnd) * 0.5),
      new THREE.Vector3(xOffset, 7.5, zEnd),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [xOffset, zStart, zEnd]);

  const material = useMemo(() => new THREE.LineBasicMaterial({ color: C_SEAM, transparent: true, opacity: 0.25 }), []);
  const line = useMemo(() => new THREE.Line(geo, material), [geo, material]);

  return <primitive object={line} />;
}

// ─── Background Monolith ─────────────────────────────────────────────────────
function BackgroundMonolith({ x, z, height, width }: {
  x: number; z: number; height: number; width: number;
}) {
  return (
    <mesh material={matStructure} position={[x, height / 2 - 4, z]}>
      <boxGeometry args={[width, height, width * 0.8]} />
    </mesh>
  );
}

// ─── Floor Channel ───────────────────────────────────────────────────────────
function FloorChannel({ length }: { length: number }) {
  return (
    <group position={[0, -3.5, 0]}>
      {/* Channel body */}
      <mesh material={matPanel} receiveShadow>
        <boxGeometry args={[0.8, 0.2, length]} />
      </mesh>
      {/* Left rail seam */}
      <mesh material={matSeamDim} position={[-0.38, 0.11, 0]}>
        <boxGeometry args={[0.04, 0.04, length]} />
      </mesh>
      {/* Right rail seam */}
      <mesh material={matSeamDim} position={[0.38, 0.11, 0]}>
        <boxGeometry args={[0.04, 0.04, length]} />
      </mesh>
    </group>
  );
}

// ─── Main BlockchainStructure ────────────────────────────────────────────────
export default function BlockchainStructure({ scrollProgress, positionZ = -18 }: BlockchainStructureProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Activate data panels as camera travels deeper
  const p = scrollProgress;

  return (
    <group ref={groupRef} position={[0, 0, positionZ]}>

      {/* ── FLOOR ─────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.8, 0]} receiveShadow>
        <planeGeometry args={[30, 55]} />
        <meshStandardMaterial color={C_STRUCTURE} roughness={0.9} metalness={0.1} />
      </mesh>
      <FloorChannel length={55} />
      <FloorPulse corridorLength={50} />

      {/* ── CEILING ───────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10.5, 0]}>
        <planeGeometry args={[30, 55]} />
        <meshStandardMaterial color={C_STRUCTURE} roughness={0.95} />
      </mesh>

      {/* ── CEILING TRUSSES — varied positions, sizes, angles ─── */}
      <CeilingTruss z={4}    width={22} depth={2.5}  yOffset={0}    angle={0} />
      <CeilingTruss z={-3}   width={18} depth={1.8}  yOffset={-0.4} angle={0.05} />
      <CeilingTruss z={-9}   width={26} depth={3.0}  yOffset={0.3}  angle={0} />
      <CeilingTruss z={-15}  width={20} depth={2.0}  yOffset={-0.2} angle={-0.03} />
      <CeilingTruss z={-22}  width={24} depth={2.8}  yOffset={0.5}  angle={0.04} />
      <CeilingTruss z={-29}  width={16} depth={1.5}  yOffset={0}    angle={0} />

      {/* ── 1. ENTRY GATEWAY ──────────────────────────────────── */}
      <Gateway z={8} />

      {/* ── 2. CORRIDOR (Shortened) ───────────────────────────── */}
      <WallPanelLeft  z={2}    height={18} depth={3.0} />
      <WallPanelRight z={3}    height={16} depth={3.5} />
      <WallPanelLeft  z={-4}   height={12} depth={5.0} />
      <WallPanelRight z={-2}   height={12} depth={4.8} />

      {/* ── 3. DATA CHAMBER ───────────────────────────────────── */}
      <DataChamber z={-15} />

      {/* ── 4. VERIFICATION APPROACH ──────────────────────────── */}
      <TaperingApproach zStart={-24} length={12} />

      {/* ── DATA PANELS — embedded in walls ──────────────────── */}
      {/* Left wall data panels */}
      <DataPanel x={-8.5} y={1}    z={5}    w={1.2} h={2.5} active={p > 0.1} />
      <DataPanel x={-8.5} y={-0.5} z={-2}   w={0.8} h={1.8} active={p > 0.25} />
      <DataPanel x={-8.5} y={2}    z={-11}  w={1.4} h={3.0} active={p > 0.4} />
      <DataPanel x={-8.5} y={0.5}  z={-19}  w={1.0} h={2.2} active={p > 0.6} />
      {/* Right wall data panels */}
      <DataPanel x={8.5}  y={0}    z={2}    w={1.0} h={2.0} active={p > 0.15} />
      <DataPanel x={8.5}  y={1.5}  z={-6}   w={1.5} h={3.5} active={p > 0.3} />
      <DataPanel x={8.5}  y={-0.5} z={-14}  w={0.8} h={1.6} active={p > 0.5} />
      <DataPanel x={8.5}  y={1}    z={-22}  w={1.2} h={2.8} active={p > 0.7} />

      {/* ── OVERHEAD CABLE RACKS ──────────────────────────────── */}
      <CableRack zStart={8}   zEnd={-5}  xOffset={-4} />
      <CableRack zStart={-5}  zEnd={-18} xOffset={3}  />
      <CableRack zStart={-18} zEnd={-30} xOffset={-2} />

      {/* ── FOREGROUND OBSTRUCTIONS — cut into camera frame ──── */}
      {/* Heavy left column — very close to camera, partially offscreen */}
      <mesh material={matStructure} position={[-13, 3, 10]} castShadow>
        <boxGeometry args={[4, 22, 3.5]} />
      </mesh>
      {/* Protruding ceiling element — top of frame */}
      <mesh material={matPanel} position={[5, 10, 7]} castShadow>
        <boxGeometry args={[8, 1.2, 4]} />
      </mesh>
      {/* Right foreground mass */}
      <mesh material={matStructure} position={[12, 0, 5]} castShadow>
        <boxGeometry args={[3.5, 16, 5]} />
      </mesh>

      {/* ── BACKGROUND SILHOUETTES — disappear into fog ───────── */}
      <BackgroundMonolith x={-6}  z={-36} height={25} width={4.5} />
      <BackgroundMonolith x={7}   z={-40} height={30} width={3.5} />
      <BackgroundMonolith x={-14} z={-44} height={20} width={5.0} />
      <BackgroundMonolith x={13}  z={-38} height={22} width={4.0} />
      <BackgroundMonolith x={0}   z={-48} height={35} width={6.0} />

      {/* ── ACCENT LIGHTS — blue seam illumination ───────────── */}
      {/* Left wall accent — stationary seam glow */}
      <pointLight position={[-9, 2, -5]}  color={C_SEAM} intensity={0.6} distance={8}  decay={2} />
      <pointLight position={[-9, 1, -18]} color={C_SEAM} intensity={0.4} distance={6}  decay={2} />
      {/* Right wall accent */}
      <pointLight position={[9,  3, -10]} color={C_SEAM} intensity={0.5} distance={7}  decay={2} />
      <pointLight position={[9,  0, -25]} color={C_SEAM} intensity={0.3} distance={5}  decay={2} />

    </group>
  );
}
