import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Async thunk for fetching all courts
export const fetchCourts = createAsyncThunk(
    'courts/fetchCourts',
    async () => {
        const response = await axios.get(`${BASE_URL}/courts`);
        return response.data;
    })

const courtSlice = createSlice({
    name: "courts",
    initialState: {
        data: [],
        isLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCourts.fulfilled, (state, action) => {
                state.data = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchCourts.rejected, (state, action) => {
                state.error = action.error.message;
                state.isLoading = false;
            })
    }
})

export default courtSlice.reducer;