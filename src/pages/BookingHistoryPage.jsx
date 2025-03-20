import { fetchPaidBookings } from "@/features/courts/bookingSlice";
import { format } from 'date-fns';

import useAuthState from "@/hooks/useAuthState";

import { useEffect, useState } from "react"
import { Alert, Container, Card, Row, Col, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";



const BookingHistoryPage = () => {
    const { currentUser } = useAuthState();
    const userId = currentUser?.uid;
    const dispatch = useDispatch();
    const paidBookings = useSelector((state) => state.bookings.paidBookingsItems);
    const bookingStatus = useSelector((state) => state.bookings.paidBookingStatus);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            dispatch(fetchPaidBookings(userId));
        }
    }, [dispatch, userId]);

    return (
        <Container>
            <h1 className="my-4">Your Booking History</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {bookingStatus === "failed" && <Alert variant='danger'>Failed to load booking history.</Alert> }
            {bookingStatus === "loading" ? (
            <div className="d-flex justify-content-center">
                <Spinner animation='border' className='ms-3 mt-3' variant='primary' />
            </div>
        ) : (
            <Row>
                {paidBookings && paidBookings.length > 0 ? (
                    paidBookings.map((booking) => (
                        <Col key={booking.id} sm={12} md={6} lg={4}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>
                                        {booking.court_name}
                                    </Card.Title>
                                    <Card.Text>
                                        Location: {booking.court_location} <br />
                                        Start Time: {format(new Date(booking.start_time), 'PPPpp')} <br />
                                        End Time: {format(new Date(booking.end_time), 'PPPpp')} <br />
                                        Price: ${booking.amount} <br />
                                        Status: <span className="text-success">Paid</span>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    bookingStatus === 'succeeded' && <p>You don&apos;t have any paid bookings yet.</p>
                )}
            </Row>
        )}
        </Container>
    )
}

export default BookingHistoryPage;