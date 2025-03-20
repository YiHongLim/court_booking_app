import { useEffect, useState } from "react";
import { auth } from "../firebase"; // Ensure this points to your Firebase config

const useAuthState = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user); // Update currentUser when auth state changes
            setLoading(false); // Stop loading once user state is updated
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    return { currentUser, loading };
};

export default useAuthState;
