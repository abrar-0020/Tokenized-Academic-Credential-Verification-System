// Scene positions along Z-axis (camera travels negative Z)
export const SCENE_CONFIG = {
  scene01: {
    cameraStart: { x: 0, y: 0, z: 12 },
    cameraEnd: { x: 0, y: 0, z: 5 },
    credential: { x: 0, y: 0, z: 0 },
    scrollRange: [0, 0.25] as [number, number],
  },
  transition01to02: {
    cameraStart: { x: 0, y: 0, z: 5 },
    cameraEnd: { x: 0, y: 1, z: -8 },
    scrollRange: [0.25, 0.40] as [number, number],
  },
  scene02: {
    cameraStart: { x: 0, y: 1, z: -8 },
    cameraEnd: { x: 0, y: 0, z: -22 },
    blockchain: { x: 0, y: 0, z: -15 },
    scrollRange: [0.40, 0.60] as [number, number],
  },
  scene03: {
    cameraStart: { x: 0, y: 0, z: -22 },
    cameraEnd: { x: 0, y: 0, z: -36 },
    portal: { x: 0, y: 0, z: -30 },
    scrollRange: [0.60, 0.80] as [number, number],
  },
  scene04: {
    cameraStart: { x: 0, y: 0, z: -36 },
    cameraEnd: { x: 0, y: 8, z: -55 },
    network: { x: 0, y: 0, z: -45 },
    scrollRange: [0.80, 1.0] as [number, number],
  },
} as const;

export const SCROLL_HEIGHT = 700; // vh units for the pinned scroll container

export const COLORS = {
  background: '#050508',
  surface: '#0d0d14',
  accent: '#3b82f6',
  accentGlow: '#60a5fa',
  white: '#f0f0f0',
  muted: '#6b7280',
  error: '#ef4444',
  gold: '#c9a84c',
} as const;
