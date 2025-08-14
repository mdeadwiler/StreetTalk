import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StreetColors } from '../styles/streetStyles';
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
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  message: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: StreetColors.brand.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 4,
  },
  retryButtonText: {
    color: StreetColors.background.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
