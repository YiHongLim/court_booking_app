import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import EditBookingModal from '../components/EditBookingModal';

const BookingPage = () => {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [error, setError] = useState('');

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setShowEditModal(true);
    };

    const fetchBookings = useCallback(async () => {
        if (!currentUser) return;

        try {
            const response = await fetch(`https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/users/${currentUser?.uid}/bookings`);
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error(error);
            setError('Failed to load bookings. Please try again later.');
        }
    }, [currentUser]);

    const handleUpdateBooking = async (bookingId, newStart, newEnd) => {
        const apiUrl = `https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/bookings/${bookingId}`;
        const bookingDetails = {
            firebaseUid: currentUser?.uid,
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
        };

        // Optimistically update the state
        const updatedBookings = bookings.map(booking => {
            if (booking.id === bookingId) {
                return { ...booking, start_time: bookingDetails.startTime, end_time: bookingDetails.endTime };
            }
            return booking;
        });
        setBookings(updatedBookings);

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingDetails),
            });
            if (!response.ok) {
                throw new Error('Failed to update booking');
            }
            // No need to refetch bookings if the optimistic update is enough
        } catch (error) {
            console.error(error);
            setError('Failed to update the booking. Please try again.');
            // Roll back in case of failure
            fetchBookings();
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        const apiUrl = `https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/bookings/${bookingId}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }
            await fetchBookings();
        } catch (error) {
            console.error(error);
            setError('Failed to delete the booking. Please try again.');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return (
        <Container>
            <h1 className="my-4">Your Bookings</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                {bookings.length > 0 ? bookings.map(booking => (
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
                )) : <p>No bookings found.</p>}
                {selectedBooking && (
                    <EditBookingModal
                        show={showEditModal}
                        onHide={() => setShowEditModal(false)}
                        booking={selectedBooking}
                        onUpdate={handleUpdateBooking}
                    />
                )}
            </Row>
        </Container>
    );
};

export default BookingPage;
