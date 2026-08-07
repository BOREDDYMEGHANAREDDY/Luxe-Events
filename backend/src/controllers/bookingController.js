const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

// ─── Calculate total pricing ────────────────────────────────────
const calculatePricing = ({ basePrice, guestCount, cateringRequired, cateringType, packagePrice, venuePrice }) => {
  const guestPrice    = guestCount > 50 ? (guestCount - 50) * 500 : 0;
  const cateringPrice = cateringRequired ? (cateringType === 'both' ? guestCount * 1200 : guestCount * 800) : 0;
  const decorationPrice = basePrice * 0.15;
  const subtotal      = (packagePrice || basePrice) + guestPrice + cateringPrice + decorationPrice + (venuePrice || 0);
  const taxRate  = 18;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  return { basePrice: packagePrice || basePrice, guestPrice, cateringPrice, decorationPrice, venuePrice: venuePrice || 0, subtotal, taxRate, taxAmount, discount: 0, totalAmount };
};

// ─── POST /api/bookings ─────────────────────────────────────────
exports.createBooking = async (req, res) => {
  const {
    eventId, venueId, packageName, eventDate, eventTime,
    guestCount, catering, decoration, specialRequirements, contactDetails
  } = req.body;

  const event = await Event.findById(eventId);
  if (!event || !event.isActive) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  let venue = null, venuePrice = 0;
  if (venueId) {
    venue = await Venue.findById(venueId);
    if (venue) venuePrice = venue.pricing.basePrice;
  }

  // Find selected package
  let selectedPackage = event.packages.find(p => p.name === packageName);
  const packagePrice = selectedPackage
    ? (selectedPackage.priceType === 'per-person' ? selectedPackage.price * guestCount : selectedPackage.price)
    : event.basePrice;

  const pricing = calculatePricing({
    basePrice: event.basePrice,
    guestCount,
    cateringRequired: catering?.required,
    cateringType: catering?.type,
    packagePrice,
    venuePrice
  });

  const booking = await Booking.create({
    user:     req.user.id,
    event:    eventId,
    venue:    venueId,
    package:  selectedPackage ? {
      name: selectedPackage.name, price: packagePrice,
      includes: selectedPackage.includes, priceType: selectedPackage.priceType
    } : undefined,
    eventDate, eventTime, guestCount,
    pricing,
    catering, decoration, specialRequirements,
    contactDetails: contactDetails || {
      name:  `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      phone: req.user.phone
    },
    timeline: [{ status: 'pending', note: 'Booking created', updatedBy: req.user.id }]
  });

  await Event.findByIdAndUpdate(eventId, { $inc: { bookingCount: 1 } });

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Booking Confirmed — #${booking.bookingId}`,
      template: 'bookingConfirmation',
      data: {
        name: req.user.firstName,
        bookingId: booking.bookingId,
        eventName: event.title,
        eventDate: new Date(eventDate).toLocaleDateString('en-IN'),
        totalAmount: pricing.totalAmount,
        status: 'pending'
      }
    });
  } catch (err) {
    logger.warn(`Booking confirmation email failed: ${err.message}`);
  }

  const populated = await Booking.findById(booking._id)
    .populate('event', 'title category coverImage')
    .populate('venue', 'name location');

  res.status(201).json({ success: true, message: 'Booking created successfully', data: populated });
};

// ─── GET /api/bookings ─────────────────────────────────────────
exports.getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('event', 'title category coverImage slug')
    .populate('venue', 'name location coverImage')
    .populate('payment')
    .sort('-createdAt');

  res.json({ success: true, count: bookings.length, data: bookings });
};

// ─── GET /api/bookings/:id ─────────────────────────────────────
exports.getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event')
    .populate('venue')
    .populate('payment')
    .populate('user', 'firstName lastName email phone');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const isOwner = booking.user._id.toString() === req.user.id;
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, data: booking });
};

// ─── PUT /api/bookings/:id/cancel ─────────────────────────────
exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (booking.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
  }

  booking.status = 'cancelled';
  booking.cancellation = { reason: req.body.reason, cancelledAt: Date.now() };
  booking.timeline.push({ status: 'cancelled', note: `Cancelled by user: ${req.body.reason}`, updatedBy: req.user.id });
  await booking.save();

  res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
};

// ─── GET /api/bookings/check-availability ─────────────────────
exports.checkAvailability = async (req, res) => {
  const { eventDate, venueId } = req.query;

  const existingBookings = await Booking.countDocuments({
    venue: venueId,
    eventDate: new Date(eventDate),
    status: { $in: ['confirmed', 'in-progress', 'pending'] }
  });

  res.json({
    success: true,
    available: existingBookings === 0,
    bookingsOnDate: existingBookings
  });
};

// ─── GET /api/bookings/calculate ──────────────────────────────
exports.calculateCost = async (req, res) => {
  const { eventId, guestCount, packageName, venueId, catering } = req.query;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  let venuePrice = 0;
  if (venueId) {
    const venue = await Venue.findById(venueId);
    if (venue) venuePrice = venue.pricing.basePrice;
  }

  const selectedPackage = event.packages.find(p => p.name === packageName);
  const packagePrice = selectedPackage
    ? (selectedPackage.priceType === 'per-person' ? selectedPackage.price * parseInt(guestCount) : selectedPackage.price)
    : event.basePrice;

  const pricing = calculatePricing({
    basePrice: event.basePrice,
    guestCount: parseInt(guestCount),
    cateringRequired: catering === 'true',
    cateringType: 'veg',
    packagePrice,
    venuePrice
  });

  res.json({ success: true, data: { ...pricing, breakdown: true } });
};
