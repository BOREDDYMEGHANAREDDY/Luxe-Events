const express = require('express');
const router = express.Router();
const { Gallery } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { category, type, page = 1, limit = 24, featured } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (type) query.type = type;
  if (featured === 'true') query.isFeatured = true;
  const total = await Gallery.countDocuments(query);
  const items = await Gallery.find(query).sort('order -createdAt').skip((page-1)*limit).limit(parseInt(limit));
  res.json({ success: true, total, data: items });
});

router.post('/', protect, adminOnly, async (req, res) => {
  const item = await Gallery.create(req.body);
  res.status(201).json({ success: true, data: item });
});

module.exports = router;
