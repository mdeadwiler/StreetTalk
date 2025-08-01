// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKpei_gz4CpB8aobZGTAyPsHTlqgG1a28",
  authDomain: "street-talk-c3f72.firebaseapp.com",
  projectId: "street-talk-c3f72",
  storageBucket: "street-talk-c3f72.firebasestorage.app",
  messagingSenderId: "494250613125",
  appId: "1:494250613125:web:6f386ff5d0006029e70cec",
  measurementId: "G-PBX4DQ99FM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
export const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage: FirebaseStorage = getStorage(app);

export default app;