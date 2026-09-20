import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Workers from "./pages/Workers.jsx";
import WorkerDetail from "./pages/WorkerDetail.jsx";
import Book from "./pages/Book.jsx";
import Bookings from "./pages/Bookings.jsx";
import BookingDetail from "./pages/BookingDetail.jsx";
import Jobs from "./pages/Jobs.jsx";
import Studio from "./pages/Studio.jsx";
import Account from "./pages/Account.jsx";
import CompleteProfile from "./pages/CompleteProfile.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/workers/:id" element={<WorkerDetail />} />
            <Route path="/book/:workerId" element={<Book />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/account" element={<Account />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
