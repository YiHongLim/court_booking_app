// // src/features/courts/courtSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { fetchCourts } from './courtAPI'; // Assume you have a function to fetch courts from an API

// export const getCourts = createAsyncThunk(
//     'courts/getCourts',
//     async () => {
//         const response = await fetchCourts();
//         return response.data;
//     }
// );

// const courtSlice = createSlice({
//     name: 'courts',
//     initialState: { entities: [], loading: 'idle' },
//     reducers: {
//         // Define reducers
//     },
//     extraReducers: (builder) => {
//         builder.addCase(getCourts.pending, (state) => {
//             state.loading = 'pending';
//         })
//             .addCase(getCourts.fulfilled, (state, action) => {
//                 state.entities = action.payload;
//                 state.loading = 'idle';
//             });
//         // Handle rejected case
//     },
// });

// export default courtSlice.reducer;
