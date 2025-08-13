import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { AppError, shouldShowRetry } from '../utils/errorHandling';

interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
  style?: any;
}

export default function ErrorMessage({ error, onRetry, style }: ErrorMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{error.message}</Text>
      
      {shouldShowRetry(error) && onRetry && (
        <TouchableOpacity 
          onPress={onRetry} 
          style={styles.retryButton}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  message: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
