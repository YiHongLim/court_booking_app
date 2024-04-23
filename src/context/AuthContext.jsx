// src/context/AuthContext.js
import { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase'; // Adjust the import path as necessary
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
