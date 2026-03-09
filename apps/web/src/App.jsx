import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { RequireAuth, RequireAdmin, RedirectIfAuth } from './components/AuthGuards';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderVerificationPage from './pages/AdminOrderVerificationPage';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';
import AdminUnitsPage from './pages/AdminUnitsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminVouchersPage from './pages/AdminVouchersPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminCMSPage from './pages/AdminCMSPage';
import UserDashboardPage from './pages/UserDashboardPage';
import UserBookingStep1Page from './pages/UserBookingStep1Page';
import UserBookingStep2Page from './pages/UserBookingStep2Page';
import UserBookingStep3Page from './pages/UserBookingStep3Page';
import UserBookingStep4Page from './pages/UserBookingStep4Page';
import UserOrdersPage from './pages/UserOrdersPage';
import UserOrderDetailPage from './pages/UserOrderDetailPage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes — require admin role */}
          <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
          <Route path="/admin/pesanan" element={<RequireAdmin><AdminOrdersPage /></RequireAdmin>} />
          <Route path="/admin/pesanan/verify/:id" element={<RequireAdmin><AdminOrderVerificationPage /></RequireAdmin>} />
          <Route path="/admin/pesanan/detail/:id" element={<RequireAdmin><AdminOrderDetailPage /></RequireAdmin>} />
          <Route path="/admin/unit" element={<RequireAdmin><AdminUnitsPage /></RequireAdmin>} />
          <Route path="/admin/pengguna" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
          <Route path="/admin/pengaturan" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
          <Route path="/admin/laporan" element={<RequireAdmin><AdminReportsPage /></RequireAdmin>} />
          <Route path="/admin/voucher" element={<RequireAdmin><AdminVouchersPage /></RequireAdmin>} />
          <Route path="/admin/profil" element={<RequireAdmin><AdminProfilePage /></RequireAdmin>} />
          <Route path="/admin/cms" element={<RequireAdmin><AdminCMSPage /></RequireAdmin>} />

          {/* User Routes — require authentication */}
          <Route path="/user/dashboard" element={<RequireAuth><UserDashboardPage /></RequireAuth>} />
          <Route path="/user/pesan" element={<RequireAuth><UserBookingStep1Page /></RequireAuth>} />
          <Route path="/user/pesan/tanggal" element={<RequireAuth><UserBookingStep2Page /></RequireAuth>} />
          <Route path="/user/pesan/materi" element={<RequireAuth><UserBookingStep3Page /></RequireAuth>} />
          <Route path="/user/pesan/checkout" element={<RequireAuth><UserBookingStep4Page /></RequireAuth>} />
          <Route path="/user/riwayat" element={<RequireAuth><UserOrdersPage /></RequireAuth>} />
          <Route path="/user/riwayat/:id" element={<RequireAuth><UserOrderDetailPage /></RequireAuth>} />
          <Route path="/user/profil" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
