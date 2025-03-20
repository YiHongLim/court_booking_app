import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearBookings } from '../features/courts/bookingSlice';
import axios from 'axios';
import useAuthState from '@/hooks/useAuthState';

const CheckoutSuccess = () => {
    const dispatch = useDispatch();
    const { currentUser } = useAuthState();
    const userId = currentUser?.uid;

    useEffect(() => {
        const BASE_URL = import.meta.env.VITE_API_URL;
        if (userId) {
            axios.put('/bookings/mark-paid', { userId })
            .then(() => {
                dispatch(clearBookings());
            })
            .catch((error) => {
                console.error('Error marking bookings as paid:', error);
            })
        }
        
    }, [dispatch, userId]);

    return (
        <div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment. Your transaction has been completed.</p>
        </div>
    );
};

export default CheckoutSuccess;
