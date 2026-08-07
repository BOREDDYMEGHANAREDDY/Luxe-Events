const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/notifications', protect, async (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
