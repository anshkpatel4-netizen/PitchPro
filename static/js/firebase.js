require('dotenv').config();

const apiKey = process.env.FIREBASE_API_KEY

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "pitchpro-22318.firebaseapp.com",
  projectId: "pitchpro-22318",
  storageBucket: "pitchpro-22318.firebasestorage.app",
  messagingSenderId: "588134715021",
  appId: "1:588134715021:web:6a6c687c8e632662f15cc4"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();


export {
  auth,
  db,

  // Authentication
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  provider,
  signInWithPopup,

  // Firestore
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion
};
