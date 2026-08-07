import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingScreen from './components/common/LoadingScreen';
import './styles/globals.css';

// ─── Lazy-loaded pages ────────────────────────────────────────────
const HomePage         = lazy(() => import('./pages/HomePage'));
const EventsPage       = lazy(() => import('./pages/EventsPage'));
const EventDetailPage  = lazy(() => import('./pages/EventDetailPage'));
const VenuesPage       = lazy(() => import('./pages/VenuesPage'));
const VenueDetailPage  = lazy(() => import('./pages/VenueDetailPage'));
const GalleryPage      = lazy(() => import('./pages/GalleryPage'));
const BookingPage      = lazy(() => import('./pages/BookingPage'));
const AIPlannerPage    = lazy(() => import('./pages/AIPlannerPage'));
const ContactPage      = lazy(() => import('./pages/ContactPage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage    = lazy(() => import('./pages/VerifyEmailPage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminBookingsPage  = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminUsersPage     = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminEventsPage    = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminVenuesPage    = lazy(() => import('./pages/admin/AdminVenuesPage'));
const AdminContactsPage  = lazy(() => import('./pages/admin/AdminContactsPage'));
const AdminRevenuePage   = lazy(() => import('./pages/admin/AdminRevenuePage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));

// ─── Route guards ─────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// ─── App ──────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public — main layout */}
        <Route element={<Layout />}>
          <Route path="/"            element={<HomePage />} />
          <Route path="/events"      element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/venues"      element={<VenuesPage />} />
          <Route path="/venues/:slug" element={<VenueDetailPage />} />
          <Route path="/gallery"     element={<GalleryPage />} />
          <Route path="/ai-planner"  element={<AIPlannerPage />} />
          <Route path="/contact"     element={<ContactPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Route>

        {/* Auth pages — no layout */}
        <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"       element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        {/* Booking — requires auth */}
        <Route path="/book/:eventSlug" element={<PrivateRoute><Layout><BookingPage /></Layout></PrivateRoute>} />

        {/* User dashboard */}
        <Route path="/dashboard/*" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />

        {/* Admin panel */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="users"    element={<AdminUsersPage />} />
          <Route path="events"   element={<AdminEventsPage />} />
          <Route path="venues"   element={<AdminVenuesPage />} />
          <Route path="contacts" element={<AdminContactsPage />} />
          <Route path="revenue"  element={<AdminRevenuePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #2a2a2a',
                  borderRadius: '2px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#B8960C', secondary: '#000' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </Router>
        </AppProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
