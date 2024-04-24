// BookingCard.jsx
import { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { TextField } from '@mui/material';
import { useAuth } from '../hooks/useAuth'; // Adjust the import path as necessary
import { useDispatch } from 'react-redux';
import { createBooking } from '@/features/courts/bookingSlice';


const BookingCard = ({ courtId }) => {
    const { currentUser } = useAuth(); // Use the useAuth hook to access the current user
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Ensure we have a current user before proceeding
        if (!currentUser) {
            alert("You must be logged in to book a court.");
            return;
        }

        const bookingDetails = {
            courtId,
            firebaseUid: currentUser?.uid, // Use the UID from the currentUser object
            startTime: startDate.toISOString(), // Convert dates to ISO string for backend compatibility
            endTime: endDate.toISOString(),
        };

        dispatch(createBooking(bookingDetails))
            .unwrap()
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
