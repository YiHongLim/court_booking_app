// src/pages/BookingPage.jsx
import { useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CourtCard from "../components/CourtCard";
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourts } from '../features/courts/courtSlice';

const CourtsPage = () => {
    // const [courts, setCourts] = useState([]);
    const dispatch = useDispatch();
    const courts = useSelector((state) => state.courts);
    const { currentUser } = useContext(AuthContext); // Use the Auth context to access the current user
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchCourts())
    }, [currentUser, dispatch, navigate]); // Add navigate to the dependencies array

    return (
        <Container>
            <h1 className="my-4">Courts</h1>
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
