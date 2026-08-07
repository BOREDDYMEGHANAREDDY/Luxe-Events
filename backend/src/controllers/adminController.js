const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Payment = require('../models/Payment');
const { Contact, Testimonial } = require('../models/index');
const { sendEmail } = require('../utils/email');

// ─── GET /api/admin/dashboard ────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const now  = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const [
    totalUsers, newUsersThisMonth,
    totalBookings, pendingBookings, confirmedBookings,
    totalRevenue, monthlyRevenue,
    totalEvents, totalVenues,
    newContacts
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { status: 'captured', paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Event.countDocuments({ isActive: true }),
    Venue.countDocuments({ isActive: true }),
    Contact.countDocuments({ status: 'new' })
  ]);

  // Monthly revenue for current year
  const monthlyData = await Payment.aggregate([
    { $match: { status: 'captured', paidAt: { $gte: startOfYear } } },
    { $group: { _id: { month: { $month: '$paidAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { '_id.month': 1 } }
  ]);

  // Booking status breakdown
  const bookingStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Top events by bookings
  const topEvents = await Booking.aggregate([
    { $group: { _id: '$event', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 5 },
    { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
    { $unwind: '$event' },
    { $project: { 'event.title': 1, 'event.category': 1, count: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers, newUsersThisMonth, totalBookings, pendingBookings,
        confirmedBookings, totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0, totalEvents, totalVenues, newContacts
      },
      charts: { monthlyData, bookingStatus, topEvents }
    }
  });
};

// ─── GET /api/admin/bookings ─────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.$or = [
    { bookingId: { $regex: search, $options: 'i' } }
  ];

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('user', 'firstName lastName email phone')
    .populate('event', 'title category')
    .populate('venue', 'name location')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, total, page: parseInt(page), data: bookings });
};

// ─── PUT /api/admin/bookings/:id/status ──────────────────────────
exports.updateBookingStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'firstName email')
    .populate('event', 'title');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.status = status;
  if (adminNotes) booking.adminNotes = adminNotes;
  booking.timeline.push({
    status, note: adminNotes || `Status updated to ${status}`, updatedBy: req.user.id
  });
  await booking.save();

  // Notify user
  try {
    await sendEmail({
      to: booking.user.email,
      subject: `Booking Update — #${booking.bookingId}`,
      template: 'bookingStatusUpdate',
      data: {
        name: booking.user.firstName, bookingId: booking.bookingId,
        status, eventName: booking.event.title, adminNotes
      }
    });
  } catch (_) {}

  res.json({ success: true, message: 'Booking status updated', data: booking });
};

// ─── GET /api/admin/users ─────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, total, data: users });
};

// ─── PUT /api/admin/users/:id/toggle-active ───────────────────────
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { isActive: user.isActive } });
};

// ─── GET /api/admin/contacts ──────────────────────────────────────
exports.getContacts = async (req, res) => {
  const contacts = await Contact.find().sort('-createdAt');
  res.json({ success: true, data: contacts });
};

// ─── PUT /api/admin/testimonials/:id/approve ─────────────────────
exports.approveTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, isFeatured: req.body.isFeatured || false },
    { new: true }
  );
  res.json({ success: true, data: testimonial });
};

// ─── GET /api/admin/revenue ───────────────────────────────────────
exports.getRevenueReport = async (req, res) => {
  const { year = new Date().getFullYear(), month } = req.query;
  const match = { status: 'captured', paidAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) } };

  const daily = await Payment.aggregate([
    { $match: match },
    { $group: { _id: { day: { $dayOfMonth: '$paidAt' }, month: { $month: '$paidAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { '_id.month': 1, '_id.day': 1 } }
  ]);

  const byCategory = await Payment.aggregate([
    { $match: match },
    { $lookup: { from: 'bookings', localField: 'booking', foreignField: '_id', as: 'booking' } },
    { $unwind: '$booking' },
    { $lookup: { from: 'events', localField: 'booking.event', foreignField: '_id', as: 'event' } },
    { $unwind: '$event' },
    { $group: { _id: '$event.category', revenue: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);

  res.json({ success: true, data: { daily, byCategory } });
};
