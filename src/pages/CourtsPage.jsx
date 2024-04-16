import { useEffect, useContext } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import CourtCard from "../components/CourtCard";
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourts } from '../features/courts/courtSlice';
import CourtImageManager from '../components/CourtImageManager';


const CourtsPage = () => {
    // const [courts, setCourts] = useState([]);
    const dispatch = useDispatch();
    const { data: courts, isLoading } = useSelector((state) => state.courts);
    const { currentUser } = useContext(AuthContext); // Use the Auth context to access the current user
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchCourts())
    }, [currentUser, dispatch, navigate]); // Add navigate to the dependencies array

    return (
        <Container>
            <h1 className="my-4">Courts</h1>
            {isLoading ? (
                <div className='text-center'>
                    <Spinner animation="border" role="status">
                        <span className='visually-hidden'>Loading...</span>
                    </Spinner>
                </div>
            )
                : (
                    <Row>
                        {courts.map(court => (
                            <Col key={court.id} sm={12} md={6} lg={4}>
                                <CourtCard court={court} />
                                <CourtImageManager courtId={court.id} />

                            </Col>
                        ))}
                    </Row>
                )
            }
        </Container>

    );
};

export default CourtsPage;
