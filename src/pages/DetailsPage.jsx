import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import BookingCard from '../components/BookingCard';

const CourtDetailsPage = () => {
    const { id } = useParams(); // Court ID from URL
    const [court, setCourt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourtDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/courts/${id}`);
                if (!response.ok) throw new Error('Court not found');
                const data = await response.json();
                setCourt(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourtDetails();
    }, [id]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container className="mt-4">
            <Row>
                <Col xs={10}>
                    {court.images && court.images.length > 0 ? (
                        <Carousel>
                            {court.images.map((imageUrl, index) => (
                                <Carousel.Item key={index}>
                                    <img src={imageUrl} alt={`Court view ${index + 1}`} />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <p>No images available.</p>
                    )}
                </Col>
            </Row>
            <Row>
                <Col md={8} className="mt-3">
                    <h2>{court.name}</h2>
                    <p>{court.description}</p>
                    {/* Add more details as needed */}
                </Col>
                <Col md={4}>
                    <BookingCard courtId={id} onBookingSuccess={() => alert('Booking successful!')} />
                </Col>
            </Row>
        </Container >
    );
};

export default CourtDetailsPage;
