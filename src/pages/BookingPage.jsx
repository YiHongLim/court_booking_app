// src/pages/BookingPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth'; // Adjust path as necessary
import { format } from 'date-fns';
import EditBookingModal from '../components/EditBookingModal';

const BookingPage = () => {
    const { currentUser } = useAuth(); // Use the Auth context to access the current user
    const [bookings, setBookings] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setShowEditModal(true);
    };

    const fetchBookings = useCallback(async () => {
        if (!currentUser) return;

        const response = await fetch(`https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/users/${currentUser?.uid}/bookings`);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            setBookings(data);
        } else {
            console.error("Failed to fetch bookings");
        }
    }, [currentUser]); // Dependencies array, the function will only change if currentUser changes

    const handleUpdateBooking = async (bookingId, newStart, newEnd) => {
        const apiUrl = `https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/bookings/${bookingId}`;
        const bookingDetails = {
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
        };


        console.log(bookingDetails.endTime);

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include your authentication headers here
                },
                body: JSON.stringify(bookingDetails),
            });

            if (!response.ok) {
                throw new Error('Failed to update booking');
            }

            const updatedBooking = await response.json();
            console.log('Booking updated:', updatedBooking);

            // Refresh bookings list after successful update
            await fetchBookings();
        } catch (error) {
            console.error('Error updating booking:', error);
            alert("Failed to update the booking. Please try again.");
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return (
        <Container>
            <h1 className="my-4">Your Bookings</h1>
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
