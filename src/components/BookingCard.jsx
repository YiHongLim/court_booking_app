// BookingCard.jsx
import { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { TextField } from '@mui/material';
import { useAuth } from '../hooks/useAuth'; // Adjust the import path as necessary

const BookingCard = ({ courtId, onBookingSuccess }) => {
    const { currentUser } = useAuth(); // Use the useAuth hook to access the current user
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Ensure we have a current user before proceeding
        if (!currentUser) {
            alert("You must be logged in to book a court.");
            return;
        }

        const bookingDetails = {
            courtId: courtId,
            firebaseUid: currentUser?.uid, // Use the UID from the currentUser object
            startTime: startDate.toISOString(), // Convert dates to ISO string for backend compatibility
            endTime: endDate.toISOString(),
        };

        console.log(bookingDetails);
        const apiUrl = 'https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev/bookings'; // Use your actual API URL

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingDetails),
            });

            if (!response.ok) {
                throw new Error('Failed to create booking');
            }

            onBookingSuccess(); // Notify the parent component about the successful booking
        } catch (error) {
            console.error('Booking error:', error);
            alert("Failed to book the court. Please try again.");
        }
    };

    return (
        <Card style={{ width: '18rem' }}>
            <Card.Body>
                <Card.Title>Book This Court</Card.Title>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Form onSubmit={handleSubmit} className="my-4">
                        <Form.Group controlId="startDate">
                            <DatePicker
                                label="Start Date"
                                inputFormat="MM/dd/yyyy"
                                value={startDate}
                                onChange={setStartDate}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Form.Group>
                        <Form.Group controlId="endDate">
                            <DatePicker
                                label="End Date"
                                inputFormat="MM/dd/yyyy"
                                value={endDate}
                                onChange={setEndDate}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Book Now
                        </Button>
                    </Form>
                </LocalizationProvider>
            </Card.Body>
        </Card>
    );
};

export default BookingCard;
