import * as THREE from 'three';
// Vertex shader for the main credential mesh
export const credentialVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

// Fragment shader for the main credential mesh
export const credentialFragmentShader = `
  uniform float uTime;
  uniform vec3 uAccentColor;
  uniform vec3 uCameraPosition;
  uniform float uHolographicStrength;
  uniform float uOpacity;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  // Minimal noise for the paper texture
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    // Base paper color
    vec3 paperColor = vec3(0.96, 0.94, 0.90);
    
    // Subtle paper texture noise
    float paperNoise = noise(vUv * 80.0) * 0.04;
    paperColor += paperNoise;
    
    // Holographic strip (right side)
    float stripX = smoothstep(0.82, 0.85, vUv.x) * smoothstep(0.97, 0.94, vUv.x);
    float rainbow = sin(vUv.y * 20.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 holoColor = mix(
      vec3(0.2, 0.5, 1.0),
      vec3(0.5, 0.2, 1.0),
      sin(vUv.y * 15.0 + uTime) * 0.5 + 0.5
    );
    holoColor = mix(holoColor, vec3(0.2, 1.0, 0.7), sin(vUv.y * 10.0 - uTime * 1.5) * 0.5 + 0.5);
    
    // Fresnel rim lighting
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
    
    // Security pattern (subtle grid)
    float gridX = step(0.98, fract(vUv.x * 40.0));
    float gridY = step(0.98, fract(vUv.y * 60.0));
    float grid = max(gridX, gridY) * 0.04;
    
    // Gold border
    float borderX = smoothstep(0.0, 0.025, vUv.x) * smoothstep(1.0, 0.975, vUv.x);
    float borderY = smoothstep(0.0, 0.02, vUv.y) * smoothstep(1.0, 0.98, vUv.y);
    float border = 1.0 - (borderX * borderY);
    float innerBorder = smoothstep(0.025, 0.03, vUv.x) * smoothstep(0.975, 0.970, vUv.x) *
                        smoothstep(0.02, 0.025, vUv.y) * smoothstep(0.98, 0.975, vUv.y);
    float innerBorderLine = (1.0 - innerBorder) * borderX * borderY;

    // Transition dissolve logic with energy edge
    float dissolveThresh = uHolographicStrength;
    float noiseVal = noise(vUv * 15.0 + uTime * 0.5);
    float dissolveDiff = noiseVal - (dissolveThresh * 1.2 - 0.1);
    
    if (dissolveDiff > 0.0) {
      discard;
    }
    
    float burnEdge = 1.0 - smoothstep(0.0, 0.04, -dissolveDiff);
    vec3 burnColor = vec3(0.2, 0.6, 1.0) * 4.0; // intense blue energy edge
    
    // Compose final color
    vec3 finalColor = paperColor;
    finalColor -= grid;
    finalColor = mix(finalColor, holoColor, stripX * (0.7 + 0.3 * rainbow));
    finalColor = mix(finalColor, vec3(0.78, 0.65, 0.25), border * 0.8);
    finalColor = mix(finalColor, vec3(0.9, 0.78, 0.35), innerBorderLine * 0.6);
    
    // Add burn edge
    finalColor += burnColor * burnEdge * (1.0 - uHolographicStrength);
    
    // Rim glow
    finalColor += uAccentColor * fresnel * (0.15 + 0.5 * (1.0 - uHolographicStrength));
    
    // Subtle sheen
    float sheen = noise(vUv * 3.0 + uTime * 0.1) * 0.03;
    finalColor += sheen;
    
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

export const dissolveVertexShader = `
  attribute vec3 aTarget;
  attribute float aSize;
  attribute float aRandom;
  
  uniform float uTime;
  uniform float uProgress;
  
  varying float vAlpha;
  varying vec3 vColor;
  varying float vStage;
  
  void main() {
    float localProgress = clamp((uProgress - aRandom * 0.1) * 1.1, 0.0, 1.0);
    vec3 pos = position;
    
    float distFromCenter = length(pos.xy);
    float edgeFactor = smoothstep(1.5, 2.5, distFromCenter);
    
    float turbulenceTrigger = smoothstep(0.1, 0.4, localProgress);
    float turbulence = sin(uTime * 4.0 + aRandom * 6.28) * 0.3 * turbulenceTrigger * (edgeFactor + 0.5);
    
    if (localProgress > 0.1) {
      pos.x += turbulence;
      pos.y += turbulence * 0.8;
      pos.z += sin(uTime * 2.0 + aRandom * 3.14) * 0.1 * turbulenceTrigger;
    }
    
    float collapsePhase = smoothstep(0.35, 0.65, localProgress);
    float easedCollapse = collapsePhase * collapsePhase * (3.0 - 2.0 * collapsePhase);
    
    pos = mix(pos, aTarget, easedCollapse);
    
    float streamPhase = smoothstep(0.65, 1.0, uProgress);
    float streamZ = streamPhase * (aRandom * 25.0 - 10.0) * uTime * 3.0;
    pos.z -= streamZ;
    
    // Delayed alpha: don't start showing until progress > 0.05, fade out cleanly at the end
    vAlpha = smoothstep(0.05, 0.20, uProgress) * (1.0 - smoothstep(0.82, 1.0, localProgress)) * 0.7;
    
    vec3 paperColor = mix(vec3(0.95, 0.94, 0.91), vec3(0.83, 0.68, 0.21), step(0.9, aRandom));
    vec3 cryptoColor = vec3(0.1, 0.3, 0.9);
    vec3 streamColor = vec3(0.2, 0.6, 1.0);
    
    vColor = mix(paperColor, cryptoColor, easedCollapse);
    vColor = mix(vColor, streamColor, streamPhase);
    
    vStage = localProgress;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float sizeMod = 1.0 + collapsePhase * 0.5 + streamPhase * 2.0;
    // CRITICAL: clamp point size to prevent white-blob artifact when z is near 0
    float rawSize = aSize * sizeMod * (120.0 / max(-mvPosition.z, 5.0));
    gl_PointSize = clamp(rawSize, 0.5, 10.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const dissolveFragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vStage;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    
    float distCircle = length(center);
    float circleAlpha = smoothstep(0.5, 0.1, distCircle);
    
    vec2 absCenter = abs(center);
    float boxDist = max(absCenter.x, absCenter.y);
    float boxAlpha = step(boxDist, 0.45);
    if (vStage > 0.4) {
      if (absCenter.x > 0.15 && absCenter.x < 0.25 && absCenter.y > 0.1) boxAlpha = 0.0;
    }
    
    float collapsePhase = smoothstep(0.35, 0.65, vStage);
    float shapeAlpha = mix(circleAlpha, boxAlpha, collapsePhase);
    
    float finalAlpha = shapeAlpha * vAlpha;
    if (finalAlpha < 0.01) discard;
    
    gl_FragColor = vec4(vColor, finalAlpha);
  }
`;

export const dataStreamVertexShader = `
  attribute float aOffset;
  attribute float aSpeed;
  
  uniform float uTime;
  uniform float uProgress;
  
  varying float vAlpha;
  varying float vOffset;
  
  void main() {
    vOffset = aOffset;
    
    float flow = mod(uTime * aSpeed + aOffset, 1.0);
    vec3 pos = position;
    pos.z += (flow - 0.5) * 8.0;
    
    vAlpha = smoothstep(0.0, 0.1, flow) * smoothstep(1.0, 0.9, flow);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.0 * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const dataStreamFragmentShader = `
  varying float vAlpha;
  varying float vOffset;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha * 0.8;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(0.23, 0.51, 0.96, alpha);
  }
`;

export function createDissolveGeometry(count: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const randoms = new Float32Array(count);

  const certW = 4.8;
  const certH = 3.2;

  // Non-uniform zones — particles concentrate on meaningful credential geometry.
  // This prevents the flat rectangular white-card artifact.
  // 32% edges/border | 22% seal area | 28% text bands | 18% holographic strip
  for (let i = 0; i < count; i++) {
    const zone = Math.random();
    let px: number, py: number;

    if (zone < 0.32) {
      // ── EDGES / BORDER: parametric perimeter distribution ──
      const perim = 2 * (certW + certH);
      const t = Math.random() * perim;
      const jitter = 0.12;
      if (t < certW) {
        px = -certW / 2 + t; py = certH / 2;
      } else if (t < certW + certH) {
        px = certW / 2; py = certH / 2 - (t - certW);
      } else if (t < 2 * certW + certH) {
        px = certW / 2 - (t - certW - certH); py = -certH / 2;
      } else {
        px = -certW / 2; py = -certH / 2 + (t - 2 * certW - certH);
      }
      px += (Math.random() - 0.5) * jitter;
      py += (Math.random() - 0.5) * jitter;

    } else if (zone < 0.54) {
      // ── SEAL / EMBOSS AREA: circular cluster at top-center ──
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.32; // sqrt for uniform disk density
      px = Math.cos(angle) * r;
      py = 0.88 + Math.sin(angle) * r;

    } else if (zone < 0.82) {
      // ── TEXT BANDS: horizontal strips matching typography positions ──
      // BACHELOR OF TECHNOLOGY, ALEX CHEN, honors text, ID/date row
      const bands = [0.15, -0.06, -0.38, -0.61, -1.08, -0.94];
      const band = bands[Math.floor(Math.random() * bands.length)];
      px = (Math.random() - 0.5) * (certW * 0.72);
      py = band + (Math.random() - 0.5) * 0.09;

    } else {
      // ── HOLOGRAPHIC STRIP: right-side vertical band ──
      px = certW / 2 - 0.44 + (Math.random() - 0.5) * 0.22;
      py = (Math.random() - 0.5) * (certH * 0.82);
    }

    // Place slightly in front of credential surface (at z=0), but clamped
    // away from z=0 in camera space (camera is at z=11, credential at z=0)
    positions[i * 3]     = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = -2.0 + (Math.random() - 0.5) * 0.3;

    // Targets: collapse inward to a tight hash cluster then stream backward
    const tAngle = Math.random() * Math.PI * 2;
    const tRadius = Math.random() * 1.2;
    targets[i * 3]     = Math.cos(tAngle) * tRadius;
    targets[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
    targets[i * 3 + 2] = -4 - Math.random() * 7;

    sizes[i]   = 0.8 + Math.random() * 1.4;
    randoms[i] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

  return geometry;
}


