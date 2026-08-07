const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentHistory, getInvoice } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/:id/invoice', getInvoice);
module.exports = router;
