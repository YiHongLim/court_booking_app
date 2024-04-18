import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase'; // Ensure this path is correct

const CourtCard = ({ court }) => {
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchImages = async () => {
            const imagesRef = ref(storage, `courts/${court.id}`);
            const response = await listAll(imagesRef);
            if (response.items.length > 0) {
                const url = await getDownloadURL(response.items[0]);
                setImageUrl(url);
            }
        };
        fetchImages();
    }, [court.id]);

    const handleViewDetails = () => {
        navigate(`/courts/${court.id}`); // Directs the user to the court details page
    };

    return (
        <Card style={{ width: '18rem', height: '25rem', margin: '10px' }}>
            <Card.Img variant="top" style={{ height: '200px', objectFit: 'cover' }} src={imageUrl || 'path/to/default/image'} alt={`Image of ${court.name}`} />
            <Card.Body>
                <Card.Title>{court.name}</Card.Title>
                <Card.Text>
                    Location: {court.location}
                    {/* Include additional brief details if necessary */}
                </Card.Text>
                <Button variant="primary" onClick={handleViewDetails}>View Details</Button>
            </Card.Body>
        </Card>
    );
};

export default CourtCard;
