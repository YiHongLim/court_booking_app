import { configureStore } from '@reduxjs/toolkit';
// Import slices

import courtReducer from '../features/courts/courtSlice';
import bookingReducer from '../features/courts/bookingSlice';

export const store = configureStore({
    reducer: {
        bookings: bookingReducer,
        courts: courtReducer,
        // Add other slices as needed
    },
});
