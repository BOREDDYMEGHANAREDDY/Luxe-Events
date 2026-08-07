const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, cancelBooking, checkAvailability, calculateCost } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/check-availability', checkAvailability);
router.get('/calculate', calculateCost);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);
module.exports = router;
