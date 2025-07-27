// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

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


//Have to figure out what is going on withfirebase auth

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage: FirebaseStorage = getStorage(app);

export default app;


// import { initializeApp } from 'firebase/app';
// import {
//   getAuth,
//   initializeAuth,
//   getReactNativePersistence
// } from 'firebase/auth';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY',
//   authDomain: 'YOUR_AUTH_DOMAIN',
//   projectId: 'YOUR_PROJECT_ID',
//   storageBucket: 'YOUR_STORAGE_BUCKET',
//   messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
//   appId: 'YOUR_APP_ID',
// };

// const app = initializeApp(firebaseConfig);

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });

// export { auth };
