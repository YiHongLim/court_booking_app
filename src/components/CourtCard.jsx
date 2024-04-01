// src/components/CourtCard.jsx
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CourtCard = ({ court }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/courts/${court.id}`); // Directs the user to the court details page
    };

    return (
        <Card style={{ width: '18rem', margin: '10px' }}>
            <Card.Img variant="top" src={court.imageUrl} alt={`Image of ${court.name}`} />
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

