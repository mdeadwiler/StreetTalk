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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage: FirebaseStorage = getStorage(app);

export default app;
