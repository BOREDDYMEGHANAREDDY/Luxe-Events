const Event = require('../models/Event');
const Venue = require('../models/Venue');

// ════════════════ EVENTS ════════════════

// GET /api/events
exports.getEvents = async (req, res) => {
  const { category, featured, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { tags: { $regex: search, $options: 'i' } }
  ];

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .select('-seo')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, total, page: parseInt(page), data: events });
};

// GET /api/events/:slug
exports.getEventBySlug = async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug, isActive: true })
    .populate('venues', 'name location coverImage pricing capacity rating');
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
};

// POST /api/events (admin)
exports.createEvent = async (req, res) => {
  const event = await Event.create({ ...req.body });
  res.status(201).json({ success: true, data: event });
};

// PUT /api/events/:id (admin)
exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
};

// DELETE /api/events/:id (admin)
exports.deleteEvent = async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Event deactivated' });
};

// ════════════════ VENUES ════════════════

// GET /api/venues
exports.getVenues = async (req, res) => {
  const { type, city, minCapacity, maxCapacity, featured, page = 1, limit = 12 } = req.query;
  const query = { isActive: true };
  if (type) query.type = type;
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (featured === 'true') query.isFeatured = true;
  if (minCapacity) query['capacity.max'] = { $gte: parseInt(minCapacity) };
  if (maxCapacity) query['capacity.min'] = { $lte: parseInt(maxCapacity) };

  const total = await Venue.countDocuments(query);
  const venues = await Venue.find(query)
    .sort('-rating -isFeatured')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, total, page: parseInt(page), data: venues });
};

// GET /api/venues/:slug
exports.getVenueBySlug = async (req, res) => {
  const venue = await Venue.findOne({ slug: req.params.slug, isActive: true });
  if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
  res.json({ success: true, data: venue });
};

// POST /api/venues (admin)
exports.createVenue = async (req, res) => {
  const venue = await Venue.create(req.body);
  res.status(201).json({ success: true, data: venue });
};

// PUT /api/venues/:id (admin)
exports.updateVenue = async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
  res.json({ success: true, data: venue });
};

// GET /api/venues/:id/availability
exports.checkVenueAvailability = async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

  const { date } = req.query;
  const checkDate = new Date(date);
  const isBlocked = venue.blockedDates.some(d => new Date(d).toDateString() === checkDate.toDateString());

  res.json({ success: true, available: !isBlocked, venue: { name: venue.name, capacity: venue.capacity } });
};
