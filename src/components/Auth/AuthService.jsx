import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';

export const signUpUser = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
};

export const logoutUser = async () => {
    return signOut(auth);
};




// Continue with the rest of the service functions like storing user data...
