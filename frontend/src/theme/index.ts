import { MD3LightTheme, configureFonts } from 'react-native-paper';

export const BrandColors = {
  blue: '#1565E8',
  blueDark: '#0E4BB5',
  blueLight: '#EEF4FF',
  darkNavy: '#0B1F3A',
  darkNavySurface: '#122B4D',
  green: '#00A86B',
  greenLight: '#E8F8F1',
  red: '#EF1D2D',
  redLight: '#FEECEE',
  orange: '#F5A000',
  orangeLight: '#FEF6E6',
  
  // Neutrals
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
};

export const PipelineColors: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: '#EEF4FF', text: '#1565E8', border: '#BFDBFE' },
  contacted: { bg: '#EFF6FF', text: '#2563EB', border: '#93C5FD' },
  qualified: { bg: '#F5F3FF', text: '#7C3AED', border: '#C4B5FD' },
  quotation: { bg: '#FEF6E6', text: '#D97706', border: '#FDE68A' },
  negotiation: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
  won: { bg: '#E8F8F1', text: '#00A86B', border: '#A7F3D0' },
  lost: { bg: '#FEECEE', text: '#EF1D2D', border: '#FECACA' },
};

export const SourceColors: Record<string, { bg: string; text: string; icon: string }> = {
  meta: { bg: '#EEF4FF', text: '#1565E8', icon: 'facebook' },
  whatsapp: { bg: '#E8F8F1', text: '#00A86B', icon: 'whatsapp' },
  website: { bg: '#FEF6E6', text: '#D97706', icon: 'web' },
  referral: { bg: '#F5F3FF', text: '#7C3AED', icon: 'account-group' },
  manual: { bg: '#F1F5F9', text: '#475569', icon: 'account-edit' },
  digital_profile: { bg: '#EEF4FF', text: '#1565E8', icon: 'card-account-details' },
  digital_profile_shop: { bg: '#E8F8F1', text: '#00A86B', icon: 'shopping' },
  qr: { bg: '#FEF6E6', text: '#D97706', icon: 'qrcode' },
};

export const Breakpoints = {
  mobileSm: 375,
  mobileLg: 430,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1440,
};

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BrandColors.blue,
    onPrimary: '#FFFFFF',
    primaryContainer: BrandColors.blueLight,
    onPrimaryContainer: BrandColors.blueDark,
    secondary: BrandColors.darkNavy,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E2E8F0',
    onSecondaryContainer: BrandColors.darkNavy,
    tertiary: BrandColors.green,
    error: BrandColors.red,
    background: BrandColors.bg,
    surface: BrandColors.surface,
    surfaceVariant: BrandColors.surfaceSubtle,
    outline: BrandColors.border,
    outlineVariant: BrandColors.borderLight,
    onSurface: BrandColors.textPrimary,
    onSurfaceVariant: BrandColors.textSecondary,
  },
  roundness: 10,
};

export const Typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headingFont: "'Outfit', 'Inter', sans-serif",
  monoFont: "'Space Grotesk', monospace",
};
