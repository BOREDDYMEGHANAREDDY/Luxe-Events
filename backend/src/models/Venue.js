const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  type: {
    type: String,
    enum: ['banquet-hall', 'hotel', 'garden', 'rooftop', 'beach', 'farmhouse', 'palace', 'resort', 'convention-center'],
    required: true
  },
  location: {
    address: { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: String,
    country: { type: String, default: 'India' },
    coordinates: { lat: Number, lng: Number }
  },
  coverImage: { type: String, required: true },
  gallery: [String],
  capacity: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  pricing: {
    basePrice:     { type: Number, required: true },
    pricePerHour:  Number,
    pricePerGuest: Number,
    weekendSurcharge: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  amenities: [String],
  restrictions: [String],
  availableDates: [Date],
  blockedDates:   [Date],
  contactPerson: { name: String, phone: String, email: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  policies: { cancellation: String, payment: String, alcohol: String, outsideVendors: String }
}, { timestamps: true, toJSON: { virtuals: true } });

venueSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Venue', venueSchema);
