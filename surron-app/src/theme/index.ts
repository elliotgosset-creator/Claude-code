export const Colors = {
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A26',
  card: '#16161F',
  border: '#2A2A3A',

  primary: '#00E5FF',
  primaryDim: '#00A8BB',
  primaryGlow: 'rgba(0, 229, 255, 0.15)',

  accent: '#FF6B00',
  accentGlow: 'rgba(255, 107, 0, 0.15)',

  success: '#00FF88',
  successDim: '#00C060',
  warning: '#FFB800',
  danger: '#FF3B3B',
  dangerDim: '#CC2222',

  textPrimary: '#FFFFFF',
  textSecondary: '#8A8AA0',
  textMuted: '#4A4A60',

  modeEco: '#00FF88',
  modeTrail: '#00E5FF',
  modeEnduro: '#FFB800',
  modeRace: '#FF3B3B',
  modeCustom: '#BF00FF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.2 },
  mono: { fontSize: 13, fontWeight: '500' as const, fontFamily: 'monospace' as const },
  display: { fontSize: 48, fontWeight: '800' as const, letterSpacing: -2 },
  displayLg: { fontSize: 72, fontWeight: '800' as const, letterSpacing: -3 },
};
