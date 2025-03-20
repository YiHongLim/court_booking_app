import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { combineReducers } from 'redux';
import courtReducer from '../features/courts/courtSlice';
import bookingReducer from '../features/courts/bookingSlice';
import activeUserReducer from '../features/users/activeUserSlice';

// Create root reducer
const rootReducer = combineReducers({
  bookings: bookingReducer,
  courts: courtReducer,
  activeUser: activeUserReducer,
});

// Configure persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['bookings'], // Only persist bookings state
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
