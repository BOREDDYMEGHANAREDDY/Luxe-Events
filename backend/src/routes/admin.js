const express = require('express');
const router = express.Router();
const { getDashboard, getAllBookings, updateBookingStatus, getAllUsers, toggleUserStatus, getContacts, approveTestimonial, getRevenueReport } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserStatus);
router.get('/contacts', getContacts);
router.put('/testimonials/:id/approve', approveTestimonial);
router.get('/revenue', getRevenueReport);
module.exports = router;
