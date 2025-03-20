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
            console.log('fetchBooking')
            return response?.data; // Assuming the response body contains an array of bookings
        } catch (error) {
            return rejectWithValue('Failed to load bookings. Please try again later.');
        }
    }
);

export const fetchCartItems = createAsyncThunk(
    'bookings/fetchCartItems',
    async(firebaseUid, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${firebaseUid}/bookings/pending`);
            console.log("response", response.data)
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch cart items');
        }
    }
)

export const fetchPaidBookings = createAsyncThunk(
    'bookings/fetchPaidBookings',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/bookings/paid/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch paid bookings');
        }
    }
);

export const createBooking = createAsyncThunk(
    'bookings/createBooking',
    async (bookingDetails, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/bookings`, bookingDetails);
            // toast.success('Booking created successfully!');

            return response.data; // Assuming the API returns the created booking
        } catch (error) {
            if (error.response && error.response.status === 409) {
                return rejectWithValue(error.response.data.error);
            }
            return rejectWithValue(error.response.data || 'Failed to create booking');
        }
    }
);

// Async thunk for updating a booking
export const updateBooking = createAsyncThunk(
    'bookings/updateBooking',
    async ({ bookingId, firebaseUid, startTime, endTime }, { rejectWithValue }) => {
        try {
            console.log('API Request:', `${BASE_URL}/bookings/${bookingId}`);
            console.log('Payload:', { firebaseUid, startTime, endTime });
            await axios.put(`${BASE_URL}/bookings/${bookingId}`, {
                firebaseUid,
                startTime: startTime,
                endTime: endTime,
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
    cartItems: [],
    paidBookingItems: [],
    cartTotalAmount: 0,
    cartStatus: 'idle',
    paidBookingStatus: 'idle'
};

// The bookings slice
const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearBookings: (state) => {
            state.bookingItems = [];
            state.cartItems = [];
            state.bookingTotalQuantity = 0;
            state.bookingTotalAmount = 0;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookingItems = action.payload;
                state.bookingTotalQuantity = action.payload.length;
                 state.bookingTotalAmount = action.payload.reduce((total, booking) => total + booking.price, 0);
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchCartItems.pending, (state) => {
                state.cartStatus = 'loading';
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.cartStatus = 'succeeded';
                state.cartItems = action.payload;
                state.cartTotalAmount = action.payload.reduce((total, item) => total + item.amount, 0);
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.cartStatus = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchPaidBookings.pending, (state) => {
                state.paidBookingStatus = 'loading';
            })
            .addCase(fetchPaidBookings.fulfilled, (state, action) => {
                state.paidBookingStatus = 'succeeded';
                state.paidBookingItems = action.payload;
            })
            .addCase(fetchPaidBookings.rejected, (state, action) => {
                state.paidBookingStatus = 'failed';
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
                state.bookingTotalAmount += action.payload.price * (action.payload.quantity || 1);
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateBooking.pending, (state) => {
                state.status = 'loading';
                console.log("booking update loading")
            })
            .addCase(updateBooking.fulfilled, (state, action) => {
                console.log(1)
                state.status = 'succeeded';
                const { bookingId, startTime, endTime } = action.payload;
                const index = state.bookingItems.findIndex(booking => booking.id === bookingId);
                console.log(index)
                if (index !== -1) {
                    state.bookingTotalAmount -= state.bookingItems[index].price;
                    // Convert Date objects to strings before storing them in state
                    state.bookingItems[index] = {
                        ...state.bookingItems[index],
                        start_time: startTime,
                        end_time: endTime
                    };
                }
                console.log("booking successfully updating")
            })
            .addCase(updateBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to update booking.';
            })
            .addCase(deleteBooking.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.bookingItems = state.bookingItems.filter(booking => booking.id !== action.payload);
                if (state.bookingTotalQuantity >= 1) {
                    state.bookingTotalQuantity -= 1;
                }
                const index = state.bookingItems.findIndex(booking => booking.id === action.payload);
                 if (index !== -1) {
                     state.bookingTotalAmount -= state.bookingItems[index].price;
                 }
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

export const { clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;
