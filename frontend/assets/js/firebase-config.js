/**
 * Apviron — Firebase Configuration
 * 
 * This file initializes Firebase for the frontend.
 * 
 * ⚠ IMPORTANT: Replace the config values below with YOUR Firebase project credentials.
 *   1. Go to https://console.firebase.google.com
 *   2. Select your project (or create one)
 *   3. Go to Project Settings → General → Your apps → Web app
 *   4. Copy the firebaseConfig object
 *   5. Paste it below
 */

// Firebase SDK imports (modular v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firestore imports
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ──────────────────────────────────────────────────────────────
// 🔥 YOUR Firebase project configuration — REPLACE THESE VALUES
// ──────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyCl9kemWG3Aep4Zdv0ZsmDb2SpT3HWPySQ",
    authDomain: "apviron.firebaseapp.com",
    projectId: "apviron",
    storageBucket: "apviron.firebasestorage.app",
    messagingSenderId: "501297232471",
    appId: "1:501297232471:web:8208b71dfd22d77655c112",
    measurementId: "G-BL16LPK8QD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Auth (existing)
export { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup 
};

// Export Firestore
export {
    db,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    Timestamp
};
