const mongoose = require('mongoose');

// ─── Testimonial ─────────────────────────────────────────────
const testimonialSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  name:      { type: String, required: true },
  role:      { type: String, default: 'Client' },
  avatar:    String,
  content:   { type: String, required: true, maxlength: 500 },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  eventType: String,
  isApproved:  { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false },
  isPublic:    { type: Boolean, default: true },
}, { timestamps: true });

// ─── Contact Message ─────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  phone:      String,
  subject:    { type: String, required: true },
  message:    { type: String, required: true },
  eventType:  String,
  eventDate:  Date,
  guestCount: Number,
  budget:     Number,
  status:     { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  adminNotes: String,
  repliedAt:  Date,
  source:     { type: String, enum: ['website', 'whatsapp', 'phone', 'email'], default: 'website' }
}, { timestamps: true });

// ─── Gallery Item ─────────────────────────────────────────────
const gallerySchema = new mongoose.Schema({
  title:       String,
  description: String,
  url:         { type: String, required: true },
  thumbnailUrl: String,
  type:        { type: String, enum: ['image', 'video'], default: 'image' },
  category:    { type: String, enum: ['wedding', 'corporate', 'birthday', 'decoration', 'venue', 'food', 'other'], default: 'other' },
  tags:        [String],
  event:       { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  venue:       { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  Testimonial: mongoose.model('Testimonial', testimonialSchema),
  Contact:     mongoose.model('Contact', contactSchema),
  Gallery:     mongoose.model('Gallery', gallerySchema),
};
