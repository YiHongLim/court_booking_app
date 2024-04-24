import { configureStore } from '@reduxjs/toolkit';
// Import slices

import courtReducer from '../features/courts/courtSlice';
import bookingReducer from '../features/courts/bookingSlice';
import activeUserReducer from '../features/users/activeUserSlice';

export const store = configureStore({
    reducer: {
        bookings: bookingReducer,
        courts: courtReducer,
        activeUser: activeUserReducer,
        // Add other slices as needed
    },
});
