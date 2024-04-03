import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Adjust the path as necessary
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Button, Form, Card, Container, Alert } from 'react-bootstrap';
import PasswordResetModal from '../components/PasswordResetModal';
import { GoogleButton } from 'react-google-button'; // Install react-google-button package

// The rest of your AuthPage component...

const AuthPage = () => {
    const [email, setEmail] = useState(""); // User email
    const [password, setPassword] = useState(""); // User password
    const [error, setError] = useState(""); // Error message state
    const [showResetModal, setShowResetModal] = useState(false);
    const navigate = useNavigate();

    const handleAuthAction = async (isSignUp) => {
        setError(""); // Reset error messages before attempting
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate("/booking"); // Redirect to booking page upon successful authentication
        } catch (error) {
            setError(error.message); // Set error message to display to the user
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // This gives you a Google Access Token. You can use it to access the Google API.
            console.log(result.user);
            // Redirect the user after successful sign in
            navigate("/booking");
        } catch (error) {
            console.error(error);
            // Handle errors here, such as displaying a notification to the user
        }
    };

    return (
        <div className="auth-page" style={{ backgroundImage: "url('https://sportsvenuecalculator.com/wp-content/uploads/2022/06/2-1.jpg')" }}>
            <Container className="min-vh-100 d-flex align-items-center justify-content-center">
                <Card style={{ width: '400px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.9)' }}>
                    <Card.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>
                            <Button
                                className="w-100 mb-2"
                                variant="primary"
                                onClick={() => handleAuthAction(true)}
                            >
                                Sign Up
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-100 mb-2"
                                onClick={() => handleAuthAction(false)}
                            >
                                Log In
                            </Button>
                            <GoogleButton
                                className="w-100 mb-2"
                                onClick={handleGoogleSignIn}
                            />
                            <Button
                                variant="link"
                                onClick={() => setShowResetModal(true)}
                            >
                                Forgot Password?
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
            <PasswordResetModal show={showResetModal} onHide={() => setShowResetModal(false)} />
        </div>
    );
};
export default AuthPage;
