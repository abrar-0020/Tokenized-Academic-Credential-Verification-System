// TokCred Liquid Glass Dark Theme Tokens (from TokCred-Exact-Build.md Part A & B)

export const LiquidTokens = {
  // Colors
  bg: '#090B10', // App background (near-black with ambient depth)
  s: '#14171F', // Solid dark surface
  s2: 'rgba(255, 255, 255, 0.07)', // Secondary translucent surface
  t: '#F2F4F8', // Primary crisp text
  t2: '#9AA3B2', // Secondary muted text
  t3: '#6B7383', // Muted tertiary text, inactive icons
  b: '#3B8CFF', // Primary electric blue
  b2: '#1F6FE8', // Dark blue (pressed, gradients)
  bs: 'rgba(59, 140, 255, 0.16)', // Soft blue tint
  g: '#3DD68C', // Verified emerald green
  gs: 'rgba(61, 214, 140, 0.14)', // Verified translucent tint
  ln: 'rgba(255, 255, 255, 0.09)', // Hairline borders
  alert: '#FF8A6A', // Restrained coral failure icon
  alertBg: 'rgba(255, 122, 92, 0.14)',
  errorBorder: '#FF6B66',
  errorText: '#FF8A84',
  errorBg: 'rgba(217, 83, 79, 0.10)',

  // Glass Specular constants
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassTopRim: 'rgba(255, 255, 255, 0.30)',
  glassBottomEdge: 'rgba(255, 255, 255, 0.04)',
  glassInnerGlow: 'rgba(255, 255, 255, 0.04)',
  glassFillTop: 'rgba(255, 255, 255, 0.15)',
  glassFillBottom: 'rgba(255, 255, 255, 0.05)',

  // Radii
  radiusButton: 15,
  radiusCard: 22,
  radiusHero: 30,
  radiusIdentityCard: 28,
  radiusNavBar: 30,
  radiusSegmented: 13,
  radiusInput: 15,

  // Easing
  ease: [0.32, 0.72, 0, 1] as const,
};

export const LiquidShadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  button: {
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 13,
    elevation: 5,
  },
  identityCard: {
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  navBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },
};
