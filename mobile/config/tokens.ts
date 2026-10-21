// TokCred Design Tokens — Light & Dark theme support
export const LightColors = {
  bg: '#F7F8FA',
  s: '#FFFFFF',
  s2: '#F1F3F6',
  t: '#111318',
  t2: '#6B7280',
  t3: '#9CA3AF',
  b: '#1677FF',
  b2: '#0A5BD8',
  bs: '#EAF3FF',
  g: '#1F9D63',
  gs: '#E8F6EE',
  ln: 'rgba(17,19,24,0.07)',
  alert: '#D1583B',
  alertBg: '#FDEEEA',
  errorBorder: '#D9534F',
  errorText: '#C4403C',
  errorBg: '#FDECEC',
};

export const DarkColors = {
  bg: '#090B10', // Near-black with ambient depth
  s: '#14171F', // Solid dark surface
  s2: 'rgba(255, 255, 255, 0.07)', // Secondary translucent surface
  t: '#F2F4F8', // Primary crisp text
  t2: '#9AA3B2', // Secondary muted text
  t3: '#6B7383', // Muted tertiary text
  b: '#3B8CFF', // Primary electric blue
  b2: '#1F6FE8', // Dark blue (pressed, gradients)
  bs: 'rgba(59, 140, 255, 0.16)', // Soft blue tint
  g: '#3DD68C', // Verified emerald green
  gs: 'rgba(61, 214, 140, 0.14)', // Verified translucent tint
  ln: 'rgba(255, 255, 255, 0.09)', // Glass hairline
  alert: '#FF8A6A', // Restrained coral
  alertBg: 'rgba(255, 122, 92, 0.14)',
  errorBorder: '#FF6B66',
  errorText: '#FF8A84',
  errorBg: 'rgba(217, 83, 79, 0.10)',
};

export const getThemeColors = (theme: 'light' | 'dark') =>
  theme === 'dark' ? DarkColors : LightColors;

export const Colors = LightColors;

export const Shadows = {
  card: {
    shadowColor: '#111318',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 0,
  },
  heroIcon: {
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 0,
  },
  button: {
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 0,
  },
  idCard: {
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 0,
  },
};
