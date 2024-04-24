// Importing necessary utilities from Redux Toolkit and Redux Thunk for asynchronous actions
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Using axios for HTTP requests

const BASE_URL = import.meta.env.VITE_API_URL;

// Async thunk for acquiring user info from server.
export const getUserInfo = createAsyncThunk(
    "user/get",
    async (user_id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${user_id}`);
            return response.data; // Assuming the response body contains the latest user info.
        } catch (error) {
            return rejectWithValue('Failed to load user info. Please try again later.');
        }
    }
);

// Async thunk for updating user info.
export const updateUserInfo = createAsyncThunk(
    "user/update",
    async (params, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/users/${params.user_id}`, {
                name: params.name,
                email: params.email,
                profile_picture_url: params.profile_picture_url
            });

            return response.data; // Assuming the response body contains the updated user info.
        } catch (error) {
            return rejectWithValue('Failed to update user info. Please try again later.');
        }
    }
);

// Slice
const activeUserSlice = createSlice({
    name: "activeUser",
    initialState: null,
    reducers: {
        storeUserInMemory: (state, action) => {
            const user = { ...action.payload };

            // Debug
            //console.log("[On Store New User] Payload.", action.payload);

            return user;
        },
        releaseUserInMemory: () => {
            return null;
        }
    },
    extraReducers: (builder) => {
        // On User Info Obtained.
        builder.addCase(getUserInfo.fulfilled, (state, action) => {
            // Debug
            //console.log("[On Get User Profile] Payload.", action.payload);

            const user = {
                id: action.payload.id,
                name: action.payload.name,
                email: action.payload.email,
                profile_picture_url: action.payload.profile_picture_url
            };

            return user;
        });

        // On Updated User Info.
        builder.addCase(updateUserInfo.fulfilled, (state, action) => {
            // Debug
            console.log("[On Update User Profile] Payload.", action.payload);

            const user = {
                id: action.payload.id,
                name: action.payload.name,
                email: action.payload.email,
                profile_picture_url: action.payload.profile_picture_url
            };

            return user;
        });
    }
});

export const { storeUserInMemory, releaseUserInMemory } = activeUserSlice.actions;
export default activeUserSlice.reducer;