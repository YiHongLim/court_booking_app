// CourtDetailsPage.js
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import BookingCard from '../components/BookingCard';
import CourtImageManager from '../components/CourtImageManager'; // Import the image manager
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase'; // Make sure this points to your firebase config file

const CourtDetailsPage = () => {
    const { id } = useParams();
    const [court, setCourt] = useState(null);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const BASE_URL = import.meta.env.VITE_API_URL;
    console.log(BASE_URL)
    useEffect(() => {
        fetchCourtDetails();
        fetchImages();
    }, []);

    const fetchCourtDetails = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/courts/${id}`);
            if (!response.ok) throw new Error('Court not found');
            const data = await response.json();
            setCourt(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchImages = () => {
        const imagesRef = ref(storage, `courts/${id}`);
        listAll(imagesRef)
            .then(async (response) => {
                const urls = await Promise.all(response.items.map((item) => getDownloadURL(item)));
                setImages(urls);
            })
            .catch((error) => {
                console.error('Error fetching images:', error);
                setError('Failed to load images.');
            });
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container className="mt-4">
            <Row>
                <Col xs={12} md={8}>
                    <h2>{court?.name}</h2>
                    <p>{court?.description}</p>
                    {images.length > 0 ? (
                        <Carousel>
                            {images.map((imageUrl, index) => (
                                <Carousel.Item key={index}>
                                    <img
                                        src={imageUrl}
                                        alt={`Court view ${index + 1}`}
                                        className="d-block w-100"
                                        style={{
                                            maxHeight: '500px', // Set a maximum height
                                            objectFit: 'cover', // Cover the area without distorting the aspect ratio
                                            width: '100%', // Ensure the image spans the full width of the carousel
                                            height: '500px', // Set a fixed height for the carousel
                                            backgroundColor: 'black'
                                        }}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>

                    ) : (
                        <p>No images available.</p>
                    )}
                </Col>
                <Col xs={12} md={4}>
                    <BookingCard courtId={id} onBookingSuccess={() => alert('Booking successful!')} />
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    <CourtImageManager courtId={id} fetchImages={fetchImages} />
                </Col>
            </Row>
        </Container>
    );
};

export default CourtDetailsPage;
