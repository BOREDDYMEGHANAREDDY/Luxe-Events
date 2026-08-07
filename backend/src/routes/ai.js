const express = require('express');
const router = express.Router();
const { getRecommendations, getBudgetEstimate } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.post('/recommendations', optionalAuth, getRecommendations);
router.get('/budget-estimate', getBudgetEstimate);
module.exports = router;
