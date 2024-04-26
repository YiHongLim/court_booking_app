// components/AuthModal.js
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthModal = ({ show, handleClose, isSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUpUser, loginUser, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSignUp) {
            await signUpUser(email, password);
        } else {
            await loginUser(email, password);
        }
        if (!error) {
            handleClose();
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{isSignUp ? "Sign Up" : "Log In"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </Form.Group>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Button variant="primary" type="submit">
                        {isSignUp ? "Sign Up" : "Log In"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AuthModal;
