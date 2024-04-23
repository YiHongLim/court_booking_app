import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase'; // Ensure this path is correct

const CourtCard = ({ court }) => {
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const imagesRef = ref(storage, `courts/${court.id}`);
                const response = await listAll(imagesRef);
                if (response.items.length > 0) {
                    const url = await getDownloadURL(response.items[0]);
                    setImageUrl(url);
                } else {
                    setImageUrl('path/to/default/image'); // Fallback image
                }
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load image');
                console.error('Error fetching images', err);
                setIsLoading(false);
            }
        };
        fetchImages();
    }, [court.id]);

    const handleViewDetails = () => {
        navigate(`/courts/${court.id}`);
    };

    return (
        <Card style={{ width: '18rem', minHeight: '25rem', margin: '10px' }}>
            {isLoading ? (
                <div>Loading...</div> // Placeholder for loading state
            ) : (
                <Card.Img variant="top" style={{ height: '200px', objectFit: 'cover' }} src={imageUrl} alt={`${court.name} Image`} />
            )}
            <Card.Body className="d-flex flex-column justify-content-between ">
                <Card.Title>{court.name}</Card.Title>
                <Card.Text>
                    Location: {court.location}
                </Card.Text>
                <Card.Text>
                    Price: {court.price}
                </Card.Text>
                <Button variant="primary" onClick={handleViewDetails} aria-label={`View details about ${court.name}`}>View Details</Button>
            </Card.Body>
        </Card>
    );
};

export default CourtCard;
