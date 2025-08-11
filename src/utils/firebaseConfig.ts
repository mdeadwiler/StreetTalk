// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that all required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

// Debug logging for configuration (only log non-sensitive info)
const configDebug = {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
};
console.log('Firebase Config Debug:', JSON.stringify(configDebug));

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys);
  throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}. Please check your environment variables.`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication 
// Note: In Firebase v12 + React Native, AsyncStorage persistence is handled automatically
// by the React Native Firebase SDK. Manual configuration is typically not needed.
const auth: Auth = getAuth(app);
console.log('Firebase Auth initialized (persistence is automatic in React Native)');

export { auth };

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage: FirebaseStorage = getStorage(app);

export default app;