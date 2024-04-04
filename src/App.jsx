import { BrowserRouter, Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import BookingPage from "./pages/BookingPage"
import { AuthProvider } from "./context/AuthContext"
import CourtsPage from "./pages/CourtsPage"
import NavigationBar from "./components/NavigationBar"
import CourtDetailsPage from "./pages/DetailsPage"


function App() {

  const cartItemCount = 3;
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavigationBar cartItemCount={cartItemCount} />
        <Routes>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/courts/:id" element={<CourtDetailsPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
