
// Firebase configuration and storage setup
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mekelle-estatee.firebaseapp.com",
  projectId: "mekelle-estatee",
  storageBucket: "mekelle-estatee.appspot.com",
  messagingSenderId: "485721388568",
  appId: "1:485721388568:web:ea6aedfdd1ca7d2c52b56d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);
