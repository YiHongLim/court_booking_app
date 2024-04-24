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



import { useAuth } from '@/hooks/useAuth';
import { auth } from '../../firebase';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

import { useEffect, useState } from 'react';
import GoogleButton from 'react-google-button';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Image, Navbar, Nav, Container, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';

import { AuthContext } from '../../context/AuthContext';
import { storeUserInMemory, releaseUserInMemory } from '../../features/users/activeUserSlice';
import { setUserInLocalStorage, getUserFromLocalStorage, clearUserFromLocalStorage } from '../../utils/storage';
import PasswordResetModal from '../PasswordResetModal';

import defaultProfileImage from '../../assets/images/user-profile-default.webp';

const NavBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { currentUser } = useAuth();

    const cartItemCount = useSelector((state) => state.bookings.bookingTotalQuantity);

    const activeUser = useSelector((state) => state.activeUser);
    const [cachedUser, setCachedUser] = useState(activeUser);

    // Debug
    //console.log("[Nav Bar Component Re-render] Cached User.", cachedUser);

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

            // Debug
            //console.log("[On Registration] User.", res.user);

            handleCloseModal();
            handleStoreUserInDB(res.user);

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

            // Debug
            //console.log("[On Login] User.", res.user);

            handleCloseModal();
            handleStoreUserInDB(res.user); // The user object from Firebase

            navigate("/"); // Navigate to a more appropriate route if needed
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error);
            setError(friendlyMessage);
        }
    };

    // After successful sign-up or login
    const handleStoreUserInDB = async (user) => {
        await storeUserInDatabase({
            firebaseUid: user.uid,
            name: "Dummy",
            email: user.email,
            // You can also pass displayName or photoURL if you have them
        });
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
            //console.log("[On Login] Response.", response);

            if (!response.ok) {
                // Handle the error
                const errorText = await response.text();
                console.error('Error storing user data:', errorText);
                setError('There was a problem storing user data. Please try again.');
            }
            else {
                const user = await response.json();

                // Debug
                //console.log("[On Login Successful] Response Result (User).", user);

                // Note: We probably don't need the extra fields returned from DB.
                // Since the query from 'index.js' is 'UPDATE users SET name = $2, email = $3 WHERE firebase_uid = $1 RETURNING *'
                // 'RETURNING *' -> Return everything from the table row.
                const userObj = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profile_picture_url: user.profile_picture_url
                };

                dispatch(storeUserInMemory(userObj));
                setUserInLocalStorage(userObj);
                setCachedUser(userObj);
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
        dispatch(releaseUserInMemory());

        navigate("/");
    };
    // ==================================
    const handleProfile = () => {
        if (!cachedUser) {
            // Debug
            console.error("Attempted to Move to Profile Page but no user was found in memory + local storage. (Possibly not cached?/Missing User ID)");
            return;
        }

        navigate(`/profile/${cachedUser.id}`);
    };
    // ==================================
    useEffect(() => {
        setCachedUser(activeUser);

        // Debug
        //console.log("[On Navigation Bar Startup] Load from Redux's State (In-Memory Caching).", activeUser);

        if (!activeUser) {
            const storedUser = getUserFromLocalStorage();

            // Debug
            //console.log("[On Navigation Bar Startup] Load from Local Storage (Browser Caching)", storedUser);

            setCachedUser(storedUser);
        }
    },
        // We only want to run checks for at the beginning when the navigation bar is rendered and whenever the redux's state is changed. Test
        [activeUser]
    );
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
                        <Nav>
                            {
                                currentUser ? (
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
                                        {
                                            cachedUser ? (
                                                <div className="d-flex align-items-center">
                                                    <Image onClick={handleProfile} role="button"
                                                        className="rounded-circle"
                                                        src={
                                                            cachedUser.profile_picture_url ?
                                                                cachedUser.profile_picture_url :
                                                                defaultProfileImage
                                                        }
                                                        style={{
                                                            marginLeft: '30px',
                                                            width: '100%', height: 'auto',
                                                            minWidth: '24px', minHeight: '24px',
                                                            maxWidth: '32px', maxHeight: '32px'
                                                        }} />
                                                    <Button onClick={handleProfile} variant="outline-success"
                                                        style={{ marginLeft: '10px' }}>
                                                        {
                                                            cachedUser.name ? cachedUser.name : (
                                                                currentUser ? (currentUser.name ? currentUser.name : currentUser.email) : "N/A"
                                                            )
                                                        }
                                                    </Button>
                                                </div>
                                            ) : null
                                        }
                                        {/* ---------------------- */}
                                    </>
                                ) : (
                                    <>
                                        <Nav.Link onClick={handleOpenLoginModal}>
                                            <Button variant="outline-primary">Log In</Button>
                                        </Nav.Link>
                                        <Nav.Link onClick={handleOpenSignUpModal}>
                                            <Button variant="outline-secondary">Sign Up</Button>
                                        </Nav.Link>
                                    </>
                                )
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

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
