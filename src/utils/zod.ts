import { z } from 'zod';

// Base schemas
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(12, 'Password should be at least 12 characters');

// Post content schema
const postContentSchema = z
  .string()
  .trim()
  .min(1, 'Post content cannot be empty')
  .max(300, 'Post cannot exceed 300 characters');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Post schema
export const createPostSchema = z.object({
  content: postContentSchema,
});

// TypeScript types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;

// Validation helpers
export const validateLoginForm = (data: unknown) => {
  return loginSchema.safeParse(data);
};

export const validateRegisterForm = (data: unknown) => {
  return registerSchema.safeParse(data);
};

export const validateCreatePostForm = (data: unknown) => {
  return createPostSchema.safeParse(data);
};

// Error formatting helper
export const getZodErrorMessage = (error: z.ZodError): string => {
  const firstError = error.issues[0];
  return firstError?.message || 'Validation failed';
};

// Firebase error mapping (keeping this separate from validation)
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
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    default:
      return 'An error occurred. Please try again.';
  }
};
