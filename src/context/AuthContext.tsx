import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../utils/firebaseConfig'
import { AuthContextType, UserProfile } from '../types';
import { getUserByUsername, createUserProfile, isUsernameAvailable, getUserProfile } from '../services/userService';

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        // Load user profile when user is authenticated
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false)
  })
    return unsuscribe
  }, [])

  const login = async (username: string, password: string) => {
    // Find user by username first
    const userProfile = await getUserByUsername(username);
    if (!userProfile) {
      throw new Error('Username not found');
    }
    
    // Sign in with email and password
    await signInWithEmailAndPassword(auth, userProfile.email, password);
  }

  const register = async (email: string, username: string, password: string) => {
    // Check if username is available
    const isAvailable = await isUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }
    
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await createUserProfile(userCredential.user.uid, email, username);
  }

  const logout = async() => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout }}>
    {children }
    </AuthContext.Provider>
  )
}
  export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
