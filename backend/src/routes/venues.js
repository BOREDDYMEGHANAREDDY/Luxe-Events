const express = require('express');
const router = express.Router();
const { getVenues, getVenueBySlug, createVenue, updateVenue, checkVenueAvailability } = require('../controllers/eventVenueController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getVenues);
router.get('/:slug', getVenueBySlug);
router.get('/:id/availability', checkVenueAvailability);
router.post('/', protect, adminOnly, createVenue);
router.put('/:id', protect, adminOnly, updateVenue);
module.exports = router;
