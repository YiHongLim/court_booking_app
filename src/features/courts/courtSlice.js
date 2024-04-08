import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = "https://e7f5674d-1a2f-4c8a-9d46-3725ce9618a1-00-2tmgwv7t5ax7t.riker.replit.dev";

// Async thunk for fetching all courts
export const fetchCourts = createAsyncThunk(
    'courts/fetchCourts',
    async () => {
        const response = await axios.get(`${BASE_URL}/courts`);
        return response.data;
    })

const courtSlice = createSlice({
    name: "courts",
    initialState: [],
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchCourts.fulfilled, (state, action) => {
            return action.payload;
        })
    }
})

export default courtSlice.reducer;