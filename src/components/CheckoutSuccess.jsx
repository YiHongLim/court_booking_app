import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearBookings } from '../features/courts/bookingSlice';
import { useAuth } from '@/hooks/useAuth';

const CheckoutSuccess = () => {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const userId = currentUser?.uid;
    console.log(userId)

    useEffect(() => {
        dispatch(clearBookings(userId));
    }, [dispatch, userId]);

    return (
        <div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment. Your transaction has been completed.</p>
            {/* Include any other relevant information or links */}
        </div>
    );
};

export default CheckoutSuccess;
