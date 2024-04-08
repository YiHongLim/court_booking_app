import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebase';
import PasswordResetModal from './PasswordResetModal';
import GoogleButton from 'react-google-button';


const NavigationBar = ({ cartItemCount }) => {
    const auth = getAuth();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleOpenSignUpModal = () => setShowSignUpModal(true);
    const handleOpenLoginModal = () => setShowLoginModal(true);

    const handleCloseModal = () => {
        setShowSignUpModal(false);
        setShowLoginModal(false)
    }

    const handleAuthAction = async (isSignUp) => {
        setError("");
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            handleCloseModal();
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            handleCloseModal();
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };
    return (
        <>
            <Navbar bg="dark" expand="lg" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="/">Court Booking</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate('/courts')}>Courts</Nav.Link>
                        </Nav>
                        <Nav >
                            {!currentUser && (
                                <>
                                    <Nav.Link onClick={handleOpenLoginModal}>
                                        <Button variant="outline-primary">Log In</Button>
                                    </Nav.Link>
                                    <Nav.Link onClick={handleOpenSignUpModal}>
                                        <Button variant="outline-secondary">Sign Up</Button>
                                    </Nav.Link>
                                </>
                            )}
                            {currentUser && (
                                <>
                                    <Button variant="outline-success" onClick={() => navigate('/booking')}>
                                        Cart <Badge bg="secondary">{cartItemCount}</Badge>
                                        <span className="visually-hidden">booking items</span>
                                    </Button>
                                    <Button variant="outline-danger" onClick={handleLogout} style={{ marginLeft: '10px' }}>
                                        Logout
                                    </Button>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar >

            <Modal show={showSignUpModal || showLoginModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{showSignUpModal ? "Sign Up" : "Log In"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {showSignUpModal && (
                            <>
                                <Form.Group className="mb-3" controlId='name'>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" placeholder='Enter name'></Form.Control>
                                </Form.Group>
                            </>
                        )}
                        <Form.Group className="mb-3" controlId='formBasicEmail'>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder='Enter email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            ></Form.Control>
                            <Form.Text className='text-muted'>We&apos;ll never share your email with anyone else.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Button variant="primary" type="submit" onClick={(e) => {
                            e.preventDefault();
                            handleAuthAction(showSignUpModal);
                        }}>
                            {showSignUpModal ? "Sign Up" : "Log In"}
                        </Button>
                        <GoogleButton
                            className="mt-3"
                            onClick={handleGoogleSignIn}
                        />
                    </Form>
                </Modal.Body>
            </Modal >
        </>
    );
};

export default NavigationBar;
