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
  xxl: 48,
} as const;

// Consolidated auth styles
export const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center' as const,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: colors.primary,
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%' as const,
  },
  input: {
    width: '100%' as const,
    height: 50,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.cardBackground,
    textAlignVertical: 'top' as const,
  },
  button: {
    width: '100%' as const,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextDisabled: {
    opacity: 0.6,
  },
  linkText: {
    color: colors.primary,
    textAlign: 'center' as const,
    marginTop: spacing.md,
    fontSize: 16,
  },
  characterCounter: {
    fontSize: 12,
    textAlign: 'right' as const,
    marginBottom: spacing.md,
  },
};
