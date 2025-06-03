// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCum7p9a2xXLt4FNURbK1_V5A6HU-foxYE",
    authDomain: "random-chelenge.firebaseapp.com",
    projectId: "random-chelenge",
    storageBucket: "random-chelenge.firebasestorage.app",
    messagingSenderId: "959116929403",
    appId: "1:959116929403:web:db39ab7e1693082fe535de",
    measurementId: "G-DW2GH7FD3Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
