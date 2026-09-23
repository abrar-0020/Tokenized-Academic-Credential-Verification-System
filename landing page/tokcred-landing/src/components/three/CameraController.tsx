'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface CameraControllerProps {
  scrollProgressRef: React.MutableRefObject<number>;
  prefersReducedMotion?: boolean;
  mouseX?: number;
  mouseY?: number;
}

// Typed waypoint interface
interface Waypoint {
  progress: number;
  pos: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

/**
 * Camera journey matching scene Z positions:
 * Credential: Z=0
 * Blockchain: Z=-18
 * Verification Portal: Z=-36
 * Trust Network: Z=-58
 */
const WAYPOINTS: Waypoint[] = [
  // 0-20% Establishing
  { progress: 0.00, pos: [0, 0.2, 11], lookAt: [0, 0, 0], fov: 50 },
  { progress: 0.20, pos: [0, 0.1, 9], lookAt: [0, 0, 0], fov: 50 },
  
  // 20-30% Approach
  { progress: 0.30, pos: [0.3, 0.0, 4.5], lookAt: [0, 0, 0], fov: 45 },
  
  // 30-40% Transform (hover near, look past into the depths)
  { progress: 0.40, pos: [0.8, -0.2, 2.5], lookAt: [-0.5, 0, -8], fov: 50 },
  
  // 40-55% Fly into infrastructure (non-linear swoop)
  { progress: 0.45, pos: [2.0, 0.5, -2], lookAt: [0, 0, -12], fov: 55 },
  { progress: 0.55, pos: [-1.5, -0.5, -10], lookAt: [1, 0, -20], fov: 60 },
  
  // 55-75% Travel deep through blockchain corridor and HOLD at BlockRecord (Z=-30)
  { progress: 0.62, pos: [1.0, 0.8, -18], lookAt: [-0.5, -0.5, -28], fov: 60 },
  { progress: 0.68, pos: [0, 0, -25], lookAt: [0, 0, -30], fov: 55 }, // Arrive at BlockRecord
  { progress: 0.73, pos: [0, 0, -26], lookAt: [0, 0, -30], fov: 55 }, // Hold on BlockRecord
  
  // 73-82% Verification Portal (pulling through block into portal at Z=-36)
  { progress: 0.82, pos: [0, 0, -33], lookAt: [0, 0, -35], fov: 60 },
  
  // 80-90% Network reveal (pull back slightly to view scale)
  { progress: 0.90, pos: [0, 1, -45], lookAt: [0, 0, -58], fov: 70 },
  
  // 95-100% Dive into the center of the network
  { progress: 1.00, pos: [0, 0, -58], lookAt: [0, 0, -68], fov: 90 },
];

function lerpWaypoints(progress: number) {
  let a: Waypoint = WAYPOINTS[0];
  let b: Waypoint = WAYPOINTS[1];

  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (progress >= WAYPOINTS[i].progress && progress <= WAYPOINTS[i + 1].progress) {
      a = WAYPOINTS[i];
      b = WAYPOINTS[i + 1];
      break;
    }
    // If past last waypoint, clamp to last
    if (progress > WAYPOINTS[WAYPOINTS.length - 1].progress) {
      a = WAYPOINTS[WAYPOINTS.length - 2];
      b = WAYPOINTS[WAYPOINTS.length - 1];
    }
  }

  const range = b.progress - a.progress;
  const rawT = range === 0 ? 1 : (progress - a.progress) / range;
  const t = Math.max(0, Math.min(1, rawT)); // Clamp to prevent extrapolation explosion
  // Smooth step
  const eased = t * t * (3 - 2 * t);

  return {
    pos: [
      a.pos[0] + (b.pos[0] - a.pos[0]) * eased,
      a.pos[1] + (b.pos[1] - a.pos[1]) * eased,
      a.pos[2] + (b.pos[2] - a.pos[2]) * eased,
    ] as [number, number, number],
    lookAt: [
      a.lookAt[0] + (b.lookAt[0] - a.lookAt[0]) * eased,
      a.lookAt[1] + (b.lookAt[1] - a.lookAt[1]) * eased,
      a.lookAt[2] + (b.lookAt[2] - a.lookAt[2]) * eased,
    ] as [number, number, number],
    fov: a.fov + (b.fov - a.fov) * eased,
  };
}

const targetPos = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();

export default function CameraController({ scrollProgressRef, prefersReducedMotion, mouseX, mouseY }: CameraControllerProps) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0.5, 12));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const prevProgress = useRef(0);
  
  // Drag-to-pan state
  const isDragging = useRef(false);
  const panAngle = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent default browser right-click menu
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        isDragging.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        // Accumulate rotation based on mouse delta. Lowered sensitivity for smoother feel.
        panAngle.current.x -= e.movementX * 0.003;
        panAngle.current.y += e.movementY * 0.003;
        
        // Clamp Y angle so they don't flip upside down
        panAngle.current.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, panAngle.current.y));
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((state) => {
    const scrollProgress = prefersReducedMotion ? 0 : scrollProgressRef.current;
    const wp = lerpWaypoints(scrollProgress);
    targetPos.set(...wp.pos);
    targetLookAt.set(...wp.lookAt);

    // Adaptive lerp speed: faster during rapid scroll, slower during deep corridor travel
    const delta = Math.abs(scrollProgress - prevProgress.current);
    prevProgress.current = scrollProgress;
    
    let baseLerp = 0.05;
    // Slow down lerp during the blockchain corridor section (0.45 to 0.70)
    // to give a sense of physical travel through the architecture
    if (scrollProgress > 0.45 && scrollProgress < 0.7) {
      baseLerp = 0.02;
    }
    
    // If the user is dragging, make the camera highly responsive so it doesn't feel sluggish.
    // Otherwise, use the cinematic smoothed lerp.
    const lerpSpeed = isDragging.current ? 0.25 : Math.min(0.10, baseLerp + delta * 3);

    // Add subtle cinematic drift on top of the path
    const time = state.clock.elapsedTime;
    const driftX = Math.sin(time * 0.3) * 0.2;
    const driftY = Math.sin(time * 0.4) * 0.15;
    
    // Always apply drift first
    if (!prefersReducedMotion && !isDragging.current) {
      targetPos.x += driftX;
      targetPos.y += driftY;
      targetLookAt.x += driftX * 0.5;
      targetLookAt.y += driftY * 0.5;
    }

    // Smoothly snap the camera back to center when the user releases right-click
    if (!isDragging.current) {
      panAngle.current.x *= 0.92;
      panAngle.current.y *= 0.92;
    }

    // Interactive 360-degree pan active AFTER Scene 01
    if (scrollProgress > 0.15) {
      // Smoothly unlock the camera between 15% and 30% scroll
      const panIntensity = Math.max(0, Math.min(1, (scrollProgress - 0.15) / 0.15));
      
      const dist = 10;
      const panLookAt = new THREE.Vector3(
        targetPos.x + Math.sin(panAngle.current.x) * Math.cos(panAngle.current.y) * dist,
        targetPos.y + Math.sin(panAngle.current.y) * dist,
        targetPos.z - Math.cos(panAngle.current.x) * Math.cos(panAngle.current.y) * dist
      );
      
      targetLookAt.lerp(panLookAt, panIntensity);
    }

    currentPos.current.lerp(targetPos, lerpSpeed);
    currentLookAt.current.lerp(targetLookAt, lerpSpeed);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    if ((camera as THREE.PerspectiveCamera).fov !== undefined) {
      const pc = camera as THREE.PerspectiveCamera;
      pc.fov += (wp.fov - pc.fov) * lerpSpeed;
      pc.updateProjectionMatrix();
    }
  });

  return null;
}
