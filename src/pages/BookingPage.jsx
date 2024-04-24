import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import EditBookingModal from '../components/EditBookingModal';
import { useDispatch, useSelector } from 'react-redux';
import { deleteBooking, fetchBookings, updateBooking } from '../features/courts/bookingSlice';

const BookingPage = () => {
    const { currentUser } = useAuth();
    const userId = currentUser?.uid;
    const dispatch = useDispatch();
    const bookings = useSelector((state) => state.bookings.bookingItems);
    const bookingStatus = useSelector((state) => state.bookings.status);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) {
            dispatch(fetchBookings(userId))
        }
    }, [dispatch, userId])

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setShowEditModal(true);
    };

    const handleUpdateBooking = async (bookingId, newStart, newEnd) => {
        dispatch(updateBooking({
            bookingId,
            firebaseUid: userId,
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
        }));
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        dispatch(deleteBooking(bookingId));
    };

    return (
        <Container>
            <h1 className="my-4">Your Bookings</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {bookingStatus === "failed" && <Alert variant='danger'>Failed to load bookings.</Alert>}
            {bookingStatus === "loading" ? (
                <div className='d-flex justify-content-center'>
                    <Spinner animation='border' className='ms-3 mt-3' variant='primary' />
                </div>
            ) : (
                <Row>
                    {bookings.length > 0 ?
                        bookings.map((booking) => (
                            <Col key={booking.id} sm={12} md={6} lg={4}>
                                <Card className="mb-4">
                                    <Card.Body>
                                        <Card.Title>{booking.court_name}</Card.Title>
                                        <Card.Text>
                                            Location: {booking.court_location}<br />
                                            Start Time: {format(new Date(booking.start_time), 'PPPpp')}<br />
                                            End Time: {format(new Date(booking.end_time), 'PPPpp')}
                                        </Card.Text>
                                        <Button variant="outline-primary" onClick={() => handleEdit(booking)}>Edit</Button>
                                        <Button variant="outline-danger" onClick={() => handleDeleteBooking(booking.id)} style={{ marginLeft: '10px' }}>Delete</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )) : bookingStatus === 'succeeded' && <p>Your bookings are currently empty.</p>}
                    {selectedBooking && (
                        <EditBookingModal
                            show={showEditModal}
                            onHide={() => setShowEditModal(false)}
                            booking={selectedBooking}
                            onUpdate={handleUpdateBooking}
                        />
                    )}
                </Row>
            )}
        </Container>
    );
};

export default BookingPage;
