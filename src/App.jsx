import { BrowserRouter, Route, Routes } from "react-router-dom"
import BookingPage from "./pages/BookingPage"
import { AuthProvider } from "./context/AuthContext"
import CourtsPage from "./pages/CourtsPage"
import NavBar from "./components/NavAndAuth/NavBar"
import CourtDetailsPage from "./pages/DetailsPage"
import { Provider } from "react-redux"
import { store } from "./app/store"
import PaymentPage from "./pages/PaymentPage"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {


  return (
    <AuthProvider>
      <Provider store={store}>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/" element={<CourtsPage />} />
            <Route path="/courts/:id" element={<CourtDetailsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="*" element={<CourtsPage />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  )
}

export default App
