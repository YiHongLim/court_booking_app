// hooks/useUserAuth.js
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const useAuth = () => {
    const [error, setError] = useState('');

    const signUpUser = async (email, password) => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            return res;
        } catch (error) {
            setError(error.message);
            return null;
        }
    };

    const loginUser = async (email, password) => {
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            return res;
        } catch (error) {
            setError(error.message);
            return null;
        }
    };

    return {
        signUpUser,
        loginUser,
        error
    };
};
