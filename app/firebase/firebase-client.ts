// firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyAuCTuNXcKfzcJbisj97IRu5Au1ZnOLgfU",
  authDomain: "dayton-sheets-1377c.firebaseapp.com",
  databaseURL: "https://dayton-sheets-1377c-default-rtdb.firebaseio.com",
  projectId: "dayton-sheets-1377c",
  storageBucket: "dayton-sheets-1377c.firebasestorage.app",
  messagingSenderId: "813368943594",
  appId: "1:813368943594:web:df16633f9f0c6b21f7c893",
  measurementId: "G-0NDW05E1C6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };