// ============================================
// PayFlux AI - Design System / Theme
// mobile/src/theme/index.js
// ============================================
// Centralized design tokens — colors, typography,
// spacing, shadows. Import everywhere for consistency.

export const COLORS = {
  // Primary brand
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',

  // Accent
  accent: '#00D2FF',
  accentDark: '#00B4D8',

  // Background (dark theme)
  background: '#0A0E1A',
  surface: '#141929',
  surfaceLight: '#1E2640',
  card: '#1A2035',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B95A5',
  textMuted: '#5A6378',

  // Status
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF5252',
  info: '#448AFF',

  // Risk levels
  riskLow: '#00E676',
  riskMedium: '#FFB300',
  riskHigh: '#FF5252',
  riskCritical: '#D50000',

  // Queue status
  queued: '#FFB300',
  processing: '#448AFF',
  synced: '#00E676',
  failed: '#FF5252',
  cancelled: '#5A6378',
};

export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  semiBold: { fontFamily: 'System', fontWeight: '600' },
  bold: { fontFamily: 'System', fontWeight: '700' },
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusFull: 999,

  // Font sizes
  caption: 12,
  body: 14,
  bodyLg: 16,
  heading: 20,
  title: 24,
  hero: 32,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };
