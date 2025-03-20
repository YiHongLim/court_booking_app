import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import bookingReducer from '../features/courts/bookingSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['bookings'] // only persist bookings reducer
};

const persistedReducer = persistReducer(persistConfig, bookingReducer);

const store = configureStore({
  reducer: {
    bookings: persistedReducer,
  }
});

export const persistor = persistStore(store);
export default store;
