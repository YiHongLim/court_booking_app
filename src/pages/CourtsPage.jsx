// src/pages/BookingPage.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CourtCard from "../components/CourtCard";

const CourtsPage = () => {
    const [courts, setCourts] = useState([]);

    useEffect(() => {
        const fetchCourts = async () => {
            const response = await fetch('https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/courts');
            const data = await response.json();
            console.log(data); // Check the structure of the fetched data

            setCourts(data);
        };

        fetchCourts();
    }, []);

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
