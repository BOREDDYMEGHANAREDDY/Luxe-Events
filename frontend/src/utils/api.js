import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxe_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('luxe_token');
      localStorage.removeItem('luxe_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status, data: error.response?.data });
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail:    (token) => api.get(`/auth/verify-email/${token}`),
  getMe:          () => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Events ───────────────────────────────────────────────────────
export const eventsAPI = {
  getAll:    (params) => api.get('/events', { params }),
  getBySlug: (slug)   => api.get(`/events/${slug}`),
  create:    (data)   => api.post('/events', data),
  update:    (id, data) => api.put(`/events/${id}`, data),
  delete:    (id)     => api.delete(`/events/${id}`),
};

// ─── Venues ───────────────────────────────────────────────────────
export const venuesAPI = {
  getAll:           (params) => api.get('/venues', { params }),
  getBySlug:        (slug)   => api.get(`/venues/${slug}`),
  checkAvailability: (id, date) => api.get(`/venues/${id}/availability`, { params: { date } }),
  create:   (data)      => api.post('/venues', data),
  update:   (id, data)  => api.put(`/venues/${id}`, data),
};

// ─── Bookings ─────────────────────────────────────────────────────
export const bookingsAPI = {
  create:            (data) => api.post('/bookings', data),
  getAll:            ()     => api.get('/bookings'),
  getById:           (id)   => api.get(`/bookings/${id}`),
  cancel:            (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  checkAvailability: (params)     => api.get('/bookings/check-availability', { params }),
  calculateCost:     (params)     => api.get('/bookings/calculate', { params }),
};

// ─── Payments ─────────────────────────────────────────────────────
export const paymentsAPI = {
  createOrder:    (data) => api.post('/payments/create-order', data),
  verify:         (data) => api.post('/payments/verify', data),
  getHistory:     ()     => api.get('/payments/history'),
  getInvoice:     (id)   => api.get(`/payments/${id}/invoice`),
};

// ─── Gallery ──────────────────────────────────────────────────────
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
};

// ─── Testimonials ─────────────────────────────────────────────────
export const testimonialsAPI = {
  getAll:  () => api.get('/testimonials'),
  submit:  (data) => api.post('/testimonials', data),
};

// ─── Contact ──────────────────────────────────────────────────────
export const contactAPI = {
  send: (data) => api.post('/contact', data),
};

// ─── AI Planner ───────────────────────────────────────────────────
export const aiAPI = {
  getRecommendations: (data)   => api.post('/ai/recommendations', data),
  getBudgetEstimate:  (params) => api.get('/ai/budget-estimate', { params }),
};

// ─── Admin ────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:       () => api.get('/admin/dashboard'),
  getBookings:        (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (id, data) => api.put(`/admin/bookings/${id}/status`, data),
  getUsers:           (params) => api.get('/admin/users', { params }),
  toggleUserStatus:   (id)    => api.put(`/admin/users/${id}/toggle-active`),
  getContacts:        ()      => api.get('/admin/contacts'),
  approveTestimonial: (id, data) => api.put(`/admin/testimonials/${id}/approve`, data),
  getRevenue:         (params)   => api.get('/admin/revenue', { params }),
  createEvent:        (data)     => api.post('/events', data),
  updateEvent:        (id, data) => api.put(`/events/${id}`, data),
  createVenue:        (data)     => api.post('/venues', data),
  updateVenue:        (id, data) => api.put(`/venues/${id}`, data),
};

export default api;
