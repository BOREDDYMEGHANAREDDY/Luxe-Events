const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const testimonials = await Testimonial.find({ isApproved: true, isPublic: true }).sort('-createdAt').limit(12);
  res.json({ success: true, data: testimonials });
});

router.post('/', protect, async (req, res) => {
  const t = await Testimonial.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, message: 'Thank you! Your review will be published after approval.', data: t });
});

module.exports = router;
