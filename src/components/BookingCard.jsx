// BookingCard.jsx
import { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { ToastContainer, toast } from 'react-toastify';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { TextField } from '@mui/material';
import useAuthState  from '@/hooks/useAuthState'; // Adjust the import path as necessary
import { useDispatch } from 'react-redux';
import { createBooking } from '@/features/courts/bookingSlice';


const BookingCard = ({ courtId }) => {
    const { currentUser } = useAuthState(); 
    const [startDateTime, setStartDateTime] = useState(new Date());
    const [endDateTime, setEndDateTime] = useState(new Date());
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Ensure we have a current user before proceeding
        if (!currentUser) {
            toast.error("You must be logged in to book a court.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        if (endDateTime <= startDateTime) {
            toast.error("End date and time must be after the start date and time.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        const bookingDetails = {
            courtId,
            firebaseUid: currentUser?.uid, // Use the UID from the currentUser object
            startTime: startDateTime.toISOString(), // Convert dates to ISO string for backend compatibility
            endTime: endDateTime.toISOString(),
        };

        dispatch(createBooking(bookingDetails))
            .unwrap()
            .then(() => {
                toast.success("Booking successful!");
            })
            .catch((errorMessage) => { 
                toast.error(errorMessage || "Failed to book the court. Please try again.");
            });
    };

    return (
        <Card style={{ width: '18rem' }}>
            <Card.Body>
                <Card.Title>Book This Court</Card.Title>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Form onSubmit={handleSubmit} className="my-4">
                        <Form.Group controlId="startDateTime">
                            <DateTimePicker
                                label="Start Date & Time"
                                inputFormat="MM/dd/yyyy"
                                value={startDateTime}
                                onChange={setStartDateTime}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Form.Group>
                        <Form.Group controlId="endDate ">
                            <DateTimePicker
                                label="End Date & Time"
                                inputFormat="MM/dd/yyyy"
                                value={endDateTime}
                                onChange={setEndDateTime}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Book Now
                        </Button>
                    </Form>
                </LocalizationProvider>
            </Card.Body>
            <ToastContainer />
        </Card>
    );
};

export default BookingCard;
