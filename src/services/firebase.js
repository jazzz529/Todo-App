import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0gC21n6oQbVs0681uBl_6c5tWFbqFKxM",
  authDomain: "todo-app-fc8e9.firebaseapp.com",
  projectId: "todo-app-fc8e9",
  storageBucket: "todo-app-fc8e9.firebasestorage.app",
  messagingSenderId: "643997770194",
  appId: "1:643997770194:web:c03a9f6a9e0f15c224e80b",
  measurementId: "G-C3MMR2Y3LR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
