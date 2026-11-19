import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Auctions from './pages/Auctions';
import BidPage from './pages/BidPage';
import Payment from './pages/Payment';
import MyBids from './pages/MyBids';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auction/:id" element={<BidPage />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/my-bids" element={<MyBids />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}