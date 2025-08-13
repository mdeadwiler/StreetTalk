// Centralized error handling utilities
// Provides user-friendly error messages without changing functionality

export interface AppError {
  message: string;
  type: 'network' | 'auth' | 'permission' | 'validation' | 'rate_limit' | 'unknown';
  isRetryable: boolean;
  technical?: string; // For debugging
}

export const parseError = (error: any): AppError => {
  const errorMessage = error?.message || error?.toString() || 'An unexpected error occurred';
  const errorCode = error?.code;

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('offline') || errorCode === 'unavailable') {
    return {
      message: 'No internet connection. Please check your network and try again.',
      type: 'network',
      isRetryable: true,
      technical: errorMessage
    };
  }

  // Firebase connection issues
  if (errorMessage.includes('unavailable') || errorMessage.includes('timeout') || errorCode === 'deadline-exceeded') {
    return {
      message: 'Connection timeout. Please try again.',
      type: 'network',
      isRetryable: true,
      technical: errorMessage
    };
  }

  // Authentication errors
  if (errorMessage.includes('permission-denied') || errorCode === 'permission-denied') {
    return {
      message: 'Access denied. Please log in again.',
      type: 'auth',
      isRetryable: false,
      technical: errorMessage
    };
  }

  if (errorMessage.includes('user-not-found') || errorMessage.includes('invalid-email')) {
    return {
      message: 'Account not found. Please check your credentials.',
      type: 'auth',
      isRetryable: false,
      technical: errorMessage
    };
  }

  if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
    return {
      message: 'Incorrect password. Please try again.',
      type: 'auth',
      isRetryable: false,
      technical: errorMessage
    };
  }

  if (errorMessage.includes('email-already-in-use')) {
    return {
      message: 'This email is already registered. Try logging in instead.',
      type: 'auth',
      isRetryable: false,
      technical: errorMessage
    };
  }

  // Rate limiting errors
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return {
      message: 'You\'re doing that too often. Please wait a moment before trying again.',
      type: 'rate_limit',
      isRetryable: true,
      technical: errorMessage
    };
  }

  // Content filtering removed - free speech platform

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      message: 'Please check your input and try again.',
      type: 'validation',
      isRetryable: false,
      technical: errorMessage
    };
  }

  // Firestore permission errors
  if (errorMessage.includes('insufficient permissions') || errorMessage.includes('Missing or insufficient permissions')) {
    return {
      message: 'Access denied. Please log in again if the problem persists.',
      type: 'permission',
      isRetryable: false,
      technical: errorMessage
    };
  }

  // Generic error
  return {
    message: 'Something went wrong. Please try again.',
    type: 'unknown',
    isRetryable: true,
    technical: errorMessage
  };
};

// Helper function for consistent error logging
export const logError = (error: any, context: string) => {
  const parsedError = parseError(error);
  console.error(`[${context}] Error:`, {
    userMessage: parsedError.message,
    type: parsedError.type,
    technical: parsedError.technical,
    isRetryable: parsedError.isRetryable
  });
  return parsedError;
};

// Helper to determine if we should show retry button
export const shouldShowRetry = (error: AppError): boolean => {
  return error.isRetryable && !['validation'].includes(error.type);
};

// Helper to get retry delay based on error type
export const getRetryDelay = (error: AppError): number => {
  switch (error.type) {
    case 'rate_limit':
      return 5000; // 5 seconds
    case 'network':
      return 2000; // 2 seconds
    default:
      return 1000; // 1 second
  }
};
