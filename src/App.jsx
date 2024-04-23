import { BrowserRouter, Route, Routes } from "react-router-dom"
import BookingPage from "./pages/BookingPage"
import { AuthProvider } from "./context/AuthContext"
import CourtsPage from "./pages/CourtsPage"
import NavigationBar from "./components/NavigationBar"
import CourtDetailsPage from "./pages/DetailsPage"
import { Provider } from "react-redux"
import { store } from "./app/store"
import PaymentPage from "./components/PaymentPage"
import ProfilePage from "./pages/ProfilePage"



function App() {

  const cartItemCount = 3;
  return (
    <AuthProvider>
      <Provider store={store}>
        <BrowserRouter>
          <NavigationBar cartItemCount={cartItemCount} />
          <Routes>
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/" element={<CourtsPage />} />
            <Route path="/courts/:id" element={<CourtDetailsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="*" element={<CourtsPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  )
}

export default App
