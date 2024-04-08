// Importing necessary utilities from Redux Toolkit and Redux Thunk for asynchronous actions
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Using axios for HTTP requests

const BASE_URL = "https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev";
// Async thunk for fetching bookings for a specific user
export const fetchBookings = createAsyncThunk(
    'bookings/fetchBookings',
    async (firebaseUid, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${firebaseUid}/bookings`);
            return response.data; // Assuming the response body contains an array of bookings
        } catch (error) {
            return rejectWithValue('Failed to load bookings. Please try again later.');
        }
    }
);

// Async thunk for updating a booking
export const updateBooking = createAsyncThunk(
    'bookings/updateBooking',
    async ({ bookingId, firebaseUid, startTime, endTime }, { rejectWithValue }) => {
        try {
            await axios.put(`${BASE_URL}/bookings/${bookingId}`, {
                firebaseUid,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });
            return { bookingId, startTime, endTime }; // Return the updated booking info
        } catch (error) {
            return rejectWithValue('Failed to update the booking. Please try again.');
        }
    }
);

// Async thunk for deleting a booking
export const deleteBooking = createAsyncThunk(
    'bookings/deleteBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/${bookingId}`);
            return bookingId; // Return the id of the deleted booking
        } catch (error) {
            return rejectWithValue('Failed to delete the booking. Please try again.');
        }
    }
);

// Initial state for the bookings slice
const initialState = {
    bookings: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// The bookings slice
const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookings = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateBooking.fulfilled, (state, action) => {
                const { bookingId, startTime, endTime } = action.payload;
                const index = state.bookings.findIndex(booking => booking.id === bookingId);
                if (index !== -1) {
                    state.bookings[index] = { ...state.bookings[index], start_time: startTime, end_time: endTime };
                }
            })
            .addCase(deleteBooking.fulfilled, (state, action) => {
                state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
            });
        // Additional cases for updateBooking.pending, updateBooking.rejected, etc., can be added similarly
    },
});

export default bookingsSlice.reducer;
