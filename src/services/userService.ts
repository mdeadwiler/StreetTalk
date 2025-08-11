import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  query, 
  where,
  limit,
  serverTimestamp,
  updateDoc
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
    
    // Create user profile
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

// Check if username is available using direct query
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    console.log('Checking username availability for:', username.toLowerCase());
    const q = query(
      collection(db, 'users'), 
      where('username', '==', username.toLowerCase()),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    const isAvailable = querySnapshot.empty;
    console.log('Username availability result:', { username: username.toLowerCase(), isAvailable });
    return isAvailable;
  } catch (error: any) {
    console.error('Error checking username availability:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied - check Firestore security rules');
      throw new Error('Unable to check username availability. Please try again later.');
    }
    throw error;
  }
};

// Get user by username using direct query
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('username', '==', username.toLowerCase()),
      limit(1)
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

// ADMIN FUNCTIONS

// Check if user is admin
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userProfile = await getUserProfile(uid);
    return userProfile?.isAdmin === true || userProfile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Set user as admin (only for initial setup)
export const setUserAsAdmin = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: 'admin',
      isAdmin: true
    });
    console.log(`User ${uid} has been granted admin privileges`);
  } catch (error) {
    console.error('Error setting user as admin:', error);
    throw error;
  }
};

// Remove admin privileges
export const removeAdminPrivileges = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: 'user',
      isAdmin: false
    });
    console.log(`Admin privileges removed from user ${uid}`);
  } catch (error) {
    console.error('Error removing admin privileges:', error);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data()
      } as UserProfile);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};
