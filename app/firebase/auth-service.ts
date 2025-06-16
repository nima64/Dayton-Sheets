import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence,createUserWithEmailAndPassword,updateProfile } from "firebase/auth";
import { app } from './firebase-client'; // Adjust the import path as necessary

const auth = getAuth(app);

const handleSignIn = async (router: any, email: string, password: string) => {
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

const handleSignUp = async ( email: string, password: string, name? : string, router?: any,) => { try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // name && await updateProfile(userCredential.user, {displayName: name});
        console.log("User registered:", user);
        // router && router.push('/');
    } catch (error) {
        const errorCode = (error as any).code;
        const errorMessage = (error as any).message;
        console.error("Sign-up error for:", errorCode, errorMessage);
        console.error(`user: ${email}, password: ${password}, name: ${name}`);
    }
};

export { auth, handleSignIn, handleSignUp };
