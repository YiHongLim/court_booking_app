// Importing necessary utilities from Redux Toolkit and Redux Thunk for asynchronous actions
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Using axios for HTTP requests
import { toast } from 'react-toastify';
// import { storage } from '../../firebase';
// import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';


const BASE_URL = import.meta.env.VITE_API_URL;
// Async thunk for fetching bookings for a specific user
export const fetchBookings = createAsyncThunk(
    'bookings/fetchBookings',
    async (firebaseUid, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${firebaseUid}/bookings`);
            return response?.data; // Assuming the response body contains an array of bookings
        } catch (error) {
            return rejectWithValue('Failed to load bookings. Please try again later.');
        }
    }
);

export const createBooking = createAsyncThunk(
    'bookings/createBooking',
    async (bookingDetails, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/bookings`, bookingDetails);
            toast.success('Booking created successfully!');

            return response.data; // Assuming the API returns the created booking
        } catch (error) {
            return rejectWithValue(error.response.data || 'Failed to create booking');
        }
    }
);

// Async thunk for updating a booking
export const updateBooking = createAsyncThunk(
    'bookings/updateBooking',
    async ({ bookingId, firebaseUid, startTime, endTime }, { rejectWithValue }) => {
        try {
            // console.log(`${BASE_URL}/bookings/${bookingId}`)
            console.log(bookingId, startTime, endTime)
            await axios.put(`${BASE_URL}/bookings/${bookingId}`, {
                firebaseUid,
                startTime: startTime,
                endTime: endTime,
            });
            // console.log(bookingId, startTime, endTime)

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
            console.log(`${BASE_URL}/bookings/${bookingId}`)
            await axios.delete(`${BASE_URL}/bookings/${bookingId}`);
            return bookingId;

        } catch (error) {
            return rejectWithValue('Failed to delete the booking. Please try again.');
        }
    }
);

// Initial state for the bookings slice
const initialState = {
    bookingItems: [],
    bookingTotalQuantity: 0,
    bookingTotalAmount: 0,
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
                state.bookingItems = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Add the new booking to the bookingItems array
                state.bookingItems.push(action.payload);
                state.bookingTotalQuantity += 1;

            })
            .addCase(createBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateBooking.fulfilled, (state, action) => {
                state.status = 'succeeded'
                const { bookingId, startTime, endTime } = action.payload;
                const index = state.bookingItems.findIndex(booking => booking.id === bookingId);
                if (index !== -1) {
                    // Convert Date objects to strings before storing them in state
                    state.bookingItems[index] = {
                        ...state.bookingItems[index],
                        start_time: startTime,
                        end_time: endTime
                    };
                }
            })
            .addCase(deleteBooking.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.bookingItems = state.bookingItems.filter(booking => booking.id !== action.payload);
                if (state.bookingTotalQuantity >= 1) {
                    state.bookingTotalQuantity -= 1;
                }
            })
            .addCase(updateBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default bookingsSlice.reducer;
