// firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsRHXy_hVtcFu7seRiPa2YUKUsDjpQVRQ",
  authDomain: "dayton-firesheets.firebaseapp.com",
  projectId: "dayton-firesheets",
  storageBucket: "dayton-firesheets.firebasestorage.app",
  messagingSenderId: "151605757435",
  appId: "1:151605757435:web:ae9acd0d2069f8677d775e",
  measurementId: "G-DSDZ3YSB16"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };