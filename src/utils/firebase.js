import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBuY3gBVRu9vlpUQYFUmKGJSrrHTbZwC3I",
  authDomain: "manomitra-app.firebaseapp.com",
  projectId: "manomitra-app",
  storageBucket: "manomitra-app.firebasestorage.app",
  messagingSenderId: "861227721783",
  appId: "1:861227721783:web:b8ed31b80c29198baf0bb2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Auth exports
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Firestore exports
export const db = getFirestore(app)
