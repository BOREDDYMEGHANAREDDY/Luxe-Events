const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  category: {
    type: String,
    enum: ['wedding', 'corporate', 'birthday', 'destination-wedding', 'product-launch', 'private-celebration', 'anniversary', 'other'],
    required: true
  },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  coverImage: { type: String, required: true },
  gallery: [String],
  features: [String],
  packages: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    priceType: { type: String, enum: ['flat', 'per-person'], default: 'flat' },
    description: String,
    includes: [String],
    isPopular: { type: Boolean, default: false }
  }],
  basePrice: { type: Number, required: true },
  priceRange: { min: Number, max: Number },
  duration: { type: String, default: '1 Day' },
  minGuests: { type: Number, default: 10 },
  maxGuests: { type: Number, default: 500 },
  venues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
  seo: { metaTitle: String, metaDescription: String, keywords: [String] }
}, { timestamps: true, toJSON: { virtuals: true } });

// Auto-generate slug
eventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
