import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import MatchesPage from './pages/MatchesPage';
import TicketsPage from './pages/TicketsPage';
import GymsPage from './pages/GymsPage';
import GymDetailPage from './pages/GymDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import OwnerOnboardingPage from './pages/OwnerOnboardingPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage';
import OwnerPaymentsPage from './pages/OwnerPaymentsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FeedPage from './pages/FeedPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/gyms" element={<GymsPage />} />
              <Route path="/gyms/:id" element={<GymDetailPage />} />

              {/* Protected */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
              <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

              {/* Owner */}
              <Route path="/owner/onboarding" element={<ProtectedRoute roles={['gymOwner']}><OwnerOnboardingPage /></ProtectedRoute>} />
              <Route path="/owner/dashboard" element={<ProtectedRoute roles={['gymOwner']}><OwnerDashboardPage /></ProtectedRoute>} />
              <Route path="/owner/analytics" element={<ProtectedRoute roles={['gymOwner']}><OwnerAnalyticsPage /></ProtectedRoute>} />
              <Route path="/owner/payments" element={<ProtectedRoute roles={['gymOwner']}><OwnerPaymentsPage /></ProtectedRoute>} />
              <Route path="/owner/*" element={<ProtectedRoute roles={['gymOwner']}><OwnerDashboardPage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
