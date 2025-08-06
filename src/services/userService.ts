import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { UserProfile } from '../types';
import { validateUsernameSecure, sanitizeUserContent } from '../utils/security';

// Create user profile in Firestore
export const createUserProfile = async (
  uid: string, 
  email: string, 
  username: string
): Promise<void> => {
  try {
    // Validate username before storing
    const validation = validateUsernameSecure(username);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid username');
    }

    // Sanitize and normalize username
    const cleanUsername = sanitizeUserContent(username).toLowerCase();
    
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      username: cleanUsername,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Check if username is available
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('username', '==', username.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('username', '==', username.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return {
      uid: userDoc.id,
      ...userDoc.data()
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

// Get user profile by UID
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        uid: docSnap.id,
        ...docSnap.data()
      } as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Validate username format (using secure validation)
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  return validateUsernameSecure(username);
};

// Generate available username suggestions
export const generateUsernameSuggestions = async (baseUsername: string): Promise<string[]> => {
  const suggestions: string[] = [];
  const base = baseUsername.toLowerCase().slice(0, 8); // Ensure we don't exceed length limit
  
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${base}${i}`;
    if (suggestion.length <= 12) {
      const isAvailable = await isUsernameAvailable(suggestion);
      if (isAvailable) {
        suggestions.push(suggestion);
      }
    }
  }
  
  // Add random suffix if no numbered suggestions are available
  if (suggestions.length === 0) {
    for (let i = 0; i < 3; i++) {
      const randomSuffix = Math.floor(Math.random() * 999);
      const suggestion = `${base.slice(0, 8)}${randomSuffix}`;
      if (suggestion.length <= 12) {
        const isAvailable = await isUsernameAvailable(suggestion);
        if (isAvailable) {
          suggestions.push(suggestion);
        }
      }
    }
  }
  
  return suggestions;
};
