import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Adjust the path as necessary
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Button, Form, Modal, Row, Col, Image } from 'react-bootstrap';
import PasswordResetModal from '../components/PasswordResetModal';

// The rest of your AuthPage component...

const AuthPage = () => {
    const [modalShow, setModalShow] = useState(null); // Controls which modal is shown
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
        <Row>
            <Col md={6} className="d-flex align-items-center justify-content-center">
                <Image src="data:image/jpeg;base64,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" fluid />
            </Col>
            <Col md={6} className="p-4">
                {/* Sign Up and Log In Buttons */}
                <Button variant="primary" onClick={() => setModalShow("SignUp")}>Sign Up</Button>
                <Button variant="secondary" onClick={() => setModalShow("Login")}>Log In</Button>
                <Button variant="outline-primary" onClick={handleGoogleSignIn}>
                    Sign in with Google
                </Button>
                <Button variant="link" onClick={() => setShowResetModal(true)}>
                    Forgot Password?
                </Button>

                <PasswordResetModal show={showResetModal} onHide={() => setShowResetModal(false)} />

                {/* Authentication Modal */}
                <Modal show={modalShow !== null} onHide={() => setModalShow(null)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalShow === "SignUp" ? "Sign Up" : "Log In"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && <div className="mb-3" style={{ color: 'red' }}>{error}</div>}
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


                            <Button variant="primary" type="button" onClick={() => handleAuthAction(modalShow === "SignUp")}>
                                {modalShow === "SignUp" ? "Sign Up" : "Log In"}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Col>
        </Row>
    );
};

export default AuthPage;
