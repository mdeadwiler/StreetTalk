import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './theme';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: typography.title,
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: typography.linkText,
});
