// src/components/PasswordResetModal.jsx
import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust the import path as necessary

const PasswordResetModal = ({ show, onHide }) => {
    const [resetEmail, setResetEmail] = useState('');
    const [sendingResetEmail, setSendingResetEmail] = useState(false);
    const [resetError, setResetError] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault(); // Prevent form from causing a page refresh
        setSendingResetEmail(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            alert('Password reset email sent! Check your inbox.');
            onHide(); // Close the modal on success
        } catch (error) {
            console.error(error);
            setResetError(error.message); // Display error message
        } finally {
            setSendingResetEmail(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Reset Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {resetError && <Alert variant="danger">{resetError}</Alert>}
                <Form onSubmit={handlePasswordReset}>
                    <Form.Group>
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={sendingResetEmail}>
                        {sendingResetEmail ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default PasswordResetModal;
