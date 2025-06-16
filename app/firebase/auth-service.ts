import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence,createUserWithEmailAndPassword,updateProfile } from "firebase/auth";
import { useState } from 'react';
import { app } from './firebase-client'; // Adjust the import path as necessary

const auth = getAuth(app);

const handleSignIn = async (router: any, email: string, password: string) => {
    console.log("button clicked");
    try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user);
        router.push('/track');
    } catch (error) {
        const errorCode = (error as any).code;
        const errorMessage = (error as any).message;
        console.error("Sign-in error:", errorCode, errorMessage);
    }
};

const handleSignUp = async (router: any, email: string, password: string, name : string) => {
    console.log("button clicked");
    try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(userCredential.user, {displayName: name});
        console.log("User registered:", user);
        router.push('/');
    } catch (error) {
        const errorCode = (error as any).code;
        const errorMessage = (error as any).message;
        console.error("Sign-in error:", errorCode, errorMessage);
    }
};

export { auth, handleSignIn, handleSignUp };
