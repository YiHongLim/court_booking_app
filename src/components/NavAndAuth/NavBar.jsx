// import { useNavigate } from 'react-router-dom';
// import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
// import { useContext, useState } from 'react';
// import { AuthContext } from '../../context/AuthContext';
// import AuthModal from './AuthModal';
// import { logoutUser } from './AuthService';
// // Import any other necessary components

// const NavigationBar = ({ cartItemCount }) => {
//     const navigate = useNavigate();
//     const { currentUser } = useContext(AuthContext);
//     const [showAuthModal, setShowAuthModal] = useState(false);
//     const [isSignUp, setIsSignUp] = useState(true); // To toggle between sign up and login in the modal

//     // Other state and functions related to navigation bar display

//     const handleAuthModalClose = () => {
//         setShowAuthModal(false);
//     };

//     const handleOpenSignUpModal = () => {
//         setIsSignUp(true);
//         setShowAuthModal(true);
//     };

//     const handleOpenLoginModal = () => {
//         setIsSignUp(false);
//         setShowAuthModal(true);
//     };

//     return (
//         <>
//             <Navbar bg="dark" expand="lg" data-bs-theme="dark">
//                 <Container>
//                     <Navbar.Brand href="/">Court Booking</Navbar.Brand>
//                     <Navbar.Toggle aria-controls="basic-navbar-nav" />
//                     <Navbar.Collapse id="basic-navbar-nav">
//                         <Nav className="me-auto">
//                             <Nav.Link onClick={() => navigate('/courts')}>Courts</Nav.Link>
//                         </Nav>
//                         <Nav >
//                             {!currentUser && (
//                                 <>
//                                     <Nav.Link onClick={handleOpenLoginModal}>
//                                         <Button variant="outline-primary">Log In</Button>
//                                     </Nav.Link>
//                                     <Nav.Link onClick={handleOpenSignUpModal}>
//                                         <Button variant="outline-secondary">Sign Up</Button>
//                                     </Nav.Link>
//                                 </>
//                             )}
//                             {currentUser && (
//                                 <>
//                                     <Button variant="outline-success" onClick={() => navigate('/booking')}>
//                                         Cart <Badge bg="secondary">{cartItemCount}</Badge>
//                                         <span className="visually-hidden">booking items</span>
//                                     </Button>
//                                     <Button variant="outline-danger" onClick={logoutUser} style={{ marginLeft: '10px' }}>
//                                         Logout
//                                     </Button>
//                                 </>
//                             )}
//                         </Nav>
//                     </Navbar.Collapse>
//                 </Container>
//             </Navbar >

//             <AuthModal
//                 showSignUp={isSignUp}
//                 showLogin={!isSignUp}
//                 handleClose={handleAuthModalClose}
//             />
//         </>
//     );
// };

// export default NavigationBar;




import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../features/users/activeUserSlice';
import { auth } from '../../firebase';
import PasswordResetModal from '../PasswordResetModal';
import GoogleButton from 'react-google-button';
import { useAuth } from '@/hooks/useAuth';
import { setUserInLocalStorage, getUserFromLocalStorage, clearUserFromLocalStorage } from '../../utils/storage';
import { useDispatch, useSelector } from 'react-redux';

const NavBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const { currentUser, setCurrentUser } = useAuth();
    const cartItemCount = useSelector((state) => state.bookings.bookingTotalQuantity);

    const BASE_URL = import.meta.env.VITE_API_URL;

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleOpenSignUpModal = () => setShowSignUpModal(true);
    const handleOpenLoginModal = () => setShowLoginModal(true);

    const handleCloseModal = () => {
        setShowSignUpModal(false);
        setShowLoginModal(false)
    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await createUserWithEmailAndPassword(
                auth,
                // TODO: Save the name to the user's profile or in your database
                email,
                password
            );
            setUserInLocalStorage({ uid: res.user.uid, email: res.user.email });
            console.log(res.user);
            handleCloseModal();
            navigate("/"); // Navigate to a more appropriate route if needed
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error);
            setError(friendlyMessage);
        }

    };
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            setUserInLocalStorage({ uid: res.user.uid, email: res.user.email });

            console.log(res.user);
            handleCloseModal();

            // After successful sign-up or login
            const user = res.user; // The user object from Firebase
            await storeUserInDatabase({
                firebaseUid: user.uid,
                name: "Dummy",
                email: user.email,
                // You can also pass displayName or photoURL if you have them
            });

            navigate("/"); // Navigate to a more appropriate route if needed
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error);
            setError(friendlyMessage);
        }

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

    const storeUserInDatabase = async (userData) => {
        try {
            const response = await fetch(`${BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Debug
            //console.log("[On Login Successful] Response.", response);

            if (!response.ok) {
                // Handle the error
                const errorText = await response.text();
                console.error('Error storing user data:', errorText);
                setError('There was a problem storing user data. Please try again.');
            }
            else {
                const user = await response.json();

                // Debug
                console.log("[On Login Successful] Response Result (User).", user);

                if (user) {
                    setUserId(user.id);
                    setName(user.name);
                    dispatch(login(user.id));
                }
            }
        } catch (error) {
            console.error('Error storing user data:', error);
            setError('Failed to connect to the database. Please check your connection.');
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const res = await signInWithPopup(auth, provider);

            // User data from Firebase
            const userData = {
                firebaseUid: res.user.uid,
                name: res.user.displayName, // Name from Google account
                email: res.user.email,
                // You can add more details here if required
            };

            localStorage.setItem('user', JSON.stringify({
                uid: res.user.uid,
                name: res.user.displayName,
                email: res.user.email
            }));

            // Store the user data in your database
            await storeUserInDatabase(userData);

            handleCloseModal();
            navigate("/");
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error);
            setError(friendlyMessage);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        clearUserFromLocalStorage();
        navigate("/");
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = getUserFromLocalStorage();
            if (userData) {
                setCurrentUser(userData);
            }
        }
    }, [setCurrentUser]);
    // ==================================
    const handleProfile = () => {
        if (userId)
            navigate(`/profile/${userId}`);
        else {
            // Debug
            console.error("Attempted to Move to Profile Page but User ID was not stored when user logged in.");
        }
    };

    // If user is logged in (Via Email/Password Combination or Socials, use Display Name if available, otherwise Email)
    useEffect(() => {
        if (!currentUser)
            return;

        setName(currentUser.displayName ? currentUser.displayName : currentUser.email);
    }, [currentUser]);
    // ==================================
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
                                    {/* ---------------------- */}
                                    {/* Access to Profile Page */}
                                    <Button variant="outline-success" onClick={handleProfile} style={{ marginLeft: '10px' }}>
                                        {name}
                                    </Button>
                                    {/* ---------------------- */}
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
                    <Form
                        className="d-grid gap-2 px-5"
                        onSubmit={showSignUpModal ? handleSignUp : handleLogin}
                    >
                        {/* {showSignUpModal && (
                            <>
                                <Form.Group className="mb-3" controlId='name'>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder='Enter name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>
                            </>
                        )} */}
                        <Form.Group className="mb-3" controlId='formBasicEmail'>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder='Enter email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            ></Form.Control>
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
                        <Button variant="primary" type="submit">
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

export default NavBar;
