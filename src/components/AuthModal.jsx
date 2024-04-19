import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { signUpUser, loginUser, signInWithGoogle, logoutUser/* other authService functions */ } from './authService';

const AuthModal = ({ showSignUp, showLogin, handleClose }) => {
    // Local state management for the component
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        try {
            signUpUser();
            handleClose();
            // navigate()
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error);
            setError(friendlyMessage);
        }
        // Call the signUpUser function from authService
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            loginUser();
            handleClose();
            // navigate
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error);
            setError(friendlyMessage);
        }
        // Call the loginUser function from authService
    };

    const handleGoogleSignIn = async () => {
        // Call the signInWithGoogle function from authService
    };

    // Utility function to convert Firebase error code to user-friendly message
    const getFriendlyErrorMessage = (error) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already in use. Please use a different email.';
            case 'auth/invalid-email':
                return 'Invalid email address. Please check your email.';
            case 'auth/weak-password':
                return 'Password is too weak. Please use a stronger password.';
            case 'auth/user-not-found':
                return 'No user found with this email. Please sign up.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/missing-password':
                return 'Please enter your password.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    // Rest of the component logic

    return (
        <Modal show={showSignUp || showLogin} onHide={handleClose}>
            {/* Modal content here */}
        </Modal>
    );
};

export default AuthModal;
