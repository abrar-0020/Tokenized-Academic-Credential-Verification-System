// CredentialVault — Material 3 "Academic Tech Precision" Design System
// All tokens extracted from the UI screen DESIGN.md and code.html files.

export const Colors = {
  // Primary (Deep Emerald)
  primary: '#003527',
  onPrimary: '#ffffff',
  primaryContainer: '#064e3b',
  onPrimaryContainer: '#80bea6',
  primaryFixed: '#b0f0d6',
  primaryFixedDim: '#95d3ba',
  onPrimaryFixed: '#002117',
  onPrimaryFixedVariant: '#0b513d',
  inversePrimary: '#95d3ba',

  // Secondary (Muted Sage)
  secondary: '#416656',
  onSecondary: '#ffffff',
  secondaryContainer: '#c3ecd7',
  onSecondaryContainer: '#476c5b',
  secondaryFixed: '#c3ecd7',
  secondaryFixedDim: '#a8cfbc',
  onSecondaryFixed: '#002115',
  onSecondaryFixedVariant: '#294e3f',

  // Tertiary (Brass/Gold — verification seal & premium highlights only)
  tertiary: '#502000',
  onTertiary: '#ffffff',
  tertiaryContainer: '#733100',
  onTertiaryContainer: '#ff985a',
  tertiaryFixed: '#ffdbca',
  tertiaryFixedDim: '#ffb68e',
  onTertiaryFixed: '#331200',
  onTertiaryFixedVariant: '#763300',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Surface Hierarchy (Warm Ivory)
  background: '#f9f9f8',
  onBackground: '#1a1c1c',
  surface: '#f9f9f8',
  onSurface: '#1a1c1c',
  surfaceDim: '#dadad9',
  surfaceBright: '#f9f9f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f3',
  surfaceContainer: '#eeeeed',
  surfaceContainerHigh: '#e8e8e7',
  surfaceContainerHighest: '#e2e2e2',
  onSurfaceVariant: '#404944',
  surfaceVariant: '#e2e2e2',
  surfaceTint: '#2b6954',

  // Outline
  outline: '#707974',
  outlineVariant: '#bfc9c3',

  // Inverse
  inverseSurface: '#2f3130',
  inverseOnSurface: '#f1f1f0',
};

// M3 Type Scale (Inter font exclusively)
export const Typography = {
  displayLg: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '600' as const,
    letterSpacing: -1.0,
    fontFamily: 'Inter_600SemiBold',
  },
  headlineLg: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
    letterSpacing: -0.28,
    fontFamily: 'Inter_600SemiBold',
  },
  headlineLgMobile: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  titleLg: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500' as const,
    fontFamily: 'Inter_500Medium',
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    fontFamily: 'Inter_400Regular',
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
  },
  labelLg: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    fontFamily: 'Inter_500Medium',
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
  },
};

// Spacing — 4px base grid
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  gutter: 24,
  marginMobile: 16,
};

// Border radius
export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  xxl: 28,
  full: 9999,
};

// Elevation / Shadow
export const Shadow = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
};
