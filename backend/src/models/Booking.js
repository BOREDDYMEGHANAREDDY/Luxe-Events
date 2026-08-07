const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  package: {
    name: String, price: Number,
    includes: [String], priceType: String
  },
  eventDate:   { type: Date, required: true },
  eventTime:   { type: String, default: '10:00 AM' },
  guestCount:  { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  pricing: {
    basePrice:       { type: Number, required: true },
    guestPrice:      { type: Number, default: 0 },
    cateringPrice:   { type: Number, default: 0 },
    decorationPrice: { type: Number, default: 0 },
    venuePrice:      { type: Number, default: 0 },
    subtotal:        { type: Number, required: true },
    taxRate:         { type: Number, default: 18 },
    taxAmount:       { type: Number, required: true },
    discount:        { type: Number, default: 0 },
    totalAmount:     { type: Number, required: true },
    currency:        { type: String, default: 'INR' }
  },
  addons: [{
    name: String, price: Number, quantity: { type: Number, default: 1 }
  }],
  catering: {
    required: { type: Boolean, default: false },
    type:     { type: String, enum: ['veg', 'non-veg', 'both', 'none'] },
    mealsPerDay: Number
  },
  decoration: {
    theme:  String,
    colors: [String],
    style:  { type: String, enum: ['minimal', 'traditional', 'modern', 'luxury', 'floral'] }
  },
  specialRequirements: String,
  internalNotes: String,
  adminNotes: String,
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  paymentStatus: {
    type: String, enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  advanceAmount: Number,
  contactDetails: { name: String, phone: String, email: String, alternatePhone: String },
  timeline: [{
    status: String, note: String, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }],
  cancellation: { reason: String, cancelledAt: Date, refundAmount: Number, refundStatus: String }
}, { timestamps: true, toJSON: { virtuals: true } });

// Auto-generate booking ID
bookingSchema.pre('validate', function (next) {
  if (!this.bookingId) {
    const date = new Date();
    const year  = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingId = `LXE${year}${month}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
