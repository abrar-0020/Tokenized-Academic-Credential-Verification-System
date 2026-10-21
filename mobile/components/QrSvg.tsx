import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface QrSvgProps {
  seed: string;
  size?: number;
}

export const QrSvg: React.FC<QrSvgProps> = ({ seed, size = 230 }) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h * 31 + seed.charCodeAt(i)) >>> 0);
  }
  const r = () => {
    h = ((h * 1664525 + 1013904223) >>> 0);
    return h / 4294967296;
  };

  let d = '';
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue;
      if (r() > 0.5) d += `M${x} ${y}h1v1h-1z`;
    }
  }

  const finders: [number, number][] = [
    [0, 0],
    [18, 0],
    [0, 18],
  ];

  finders.forEach(([a, b]) => {
    d += `M${a} ${b}h7v7h-7zM${a + 1} ${b + 1}v5h5v-5zM${a + 2} ${b + 2}h3v3h-3z`;
  });

  return (
    <Svg width={size} height={size} viewBox="-1 -1 27 27">
      <Path fill="#111318" fillRule="evenodd" d={d} />
    </Svg>
  );
};
