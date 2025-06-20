export const Colors = {
  primary: '#1E1B4B', // Deep indigo/purple
  secondary: '#312E81', // Mid-tone purple
  accent: '#38BDF8', // Bright sky blue (neon feel)
  text: '#F8FAFC', // Off-white
  muted: '#94A3B8', // Slate gray for secondary text
  success: '#10B981', // Green for health bars
  warning: '#F59E0B', // Orange for warnings
  danger: '#EF4444', // Red for danger
  background: '#0F172A', // Very dark blue-gray
  surface: '#1E293B', // Slightly lighter surface
};

export const Fonts = {
  main: 'Orbitron_400Regular',
  bold: 'Orbitron_700Bold',
};

export const FontSizes = {
  title: 36,
  subtitle: 24,
  body: 16,
  button: 18,
  small: 14,
  large: 28,
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
  full: 9999,
};

export const Shadows = {
  glow: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};