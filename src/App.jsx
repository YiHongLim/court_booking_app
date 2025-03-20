import { BrowserRouter, Route, Routes } from "react-router-dom"
import CartPage from "./pages/CartPage"
import { AuthProvider } from "./context/AuthContext"
import CourtsPage from "./pages/CourtsPage"
import NavBar from "./components/NavBar"
import CourtDetailsPage from "./pages/DetailsPage"
import { Provider } from "react-redux"
import { store } from "./app/store"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PersistGate } from "redux-persist/integration/react"
import { persistor } from './app/store'
import PaymentPage from './pages/PaymentPage'

import ProfilePage from "./pages/ProfilePage"
import CheckoutSuccess from "./components/CheckoutSuccess"
import BookingHistoryPage from "./pages/BookingHistoryPage"
// import CheckoutCancel from "./components/CheckoutCancel"


function App() {

  return (
    <AuthProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <NavBar />
            <Routes>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/bookings" element={<BookingHistoryPage />} />
              <Route path="/" element={<CourtsPage />} />
              <Route path="/courts/:id" element={<CourtDetailsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              {/* <Route path="/checkout-cancel" element={<CheckoutCancel />} /> */}
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="*" element={<CourtsPage />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </AuthProvider>
  )
}

export default App
