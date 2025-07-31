export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 12) return 'Password should be at least 12 characters';
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Try again later.';
    case 'auth/email-already-in-use':
      return 'This email is already in use';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    default:
      return 'An error occurred. Please try again.';
  }
};
