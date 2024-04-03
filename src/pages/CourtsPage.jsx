// src/pages/BookingPage.jsx
import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CourtCard from "../components/CourtCard";
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CourtsPage = () => {
    const [courts, setCourts] = useState([]);
    const { currentUser } = useContext(AuthContext); // Use the Auth context to access the current user
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login"); // Redirect to login page if there is no current user
        } else {
            const fetchCourts = async () => {
                const response = await fetch('https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/courts');
                const data = await response.json();
                console.log(data); // Check the structure of the fetched data

                setCourts(data);
            };

            fetchCourts();
        }
    }, [currentUser, navigate]); // Add navigate to the dependencies array

    if (!currentUser) {
        return null; // Render nothing if there is no current user
    }

    return (
        <Container>
            <Row>
                {courts.map(court => (
                    <Col key={court.id} sm={12} md={6} lg={4}>
                        <CourtCard court={court} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default CourtsPage;
