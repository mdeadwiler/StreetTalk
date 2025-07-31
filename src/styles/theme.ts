export const colors = {
  primary: '#4b0082',
  background: '#000000',
  text: '#fffaf0',
  inputBorder: '#fffaf0',
  cardBackground: '#1a1a1a',
  borderColor: '#333333',
  mutedText: '#888888',
} as const;

export const spacing = {
  xs: 8,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 32,
} as const;

export const typography = {
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    color: colors.primary,
  },
  linkText: {
    textAlign: 'center' as const,
    marginTop: spacing.lg,
    color: colors.text,
    fontSize: 16,
  },
} as const;
