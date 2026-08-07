const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── POST /api/payments/create-order ────────────────────────────
exports.createOrder = async (req, res) => {
  const { bookingId, paymentType = 'advance' } = req.body;

  const booking = await Booking.findById(bookingId).populate('event');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (booking.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Calculate amount (advance = 30%, full = 100%)
  const amount = paymentType === 'advance'
    ? Math.round(booking.pricing.totalAmount * 0.3)
    : booking.pricing.totalAmount;

  // Amount in paise (INR)
  const amountInPaise = Math.round(amount * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt:  `rcpt_${booking.bookingId}`,
    notes: {
      bookingId: booking.bookingId,
      eventName: booking.event.title,
      userId:    req.user.id
    }
  });

  // Save payment record
  const payment = await Payment.create({
    booking: booking._id,
    user:    req.user.id,
    razorpay: { orderId: order.id },
    amount,
    currency: 'INR',
    status: 'created',
    paymentType,
    description: `${paymentType === 'advance' ? 'Advance (30%)' : 'Full Payment'} for booking ${booking.bookingId}`
  });

  res.json({
    success: true,
    data: {
      orderId:       order.id,
      amount:        amountInPaise,
      currency:      'INR',
      paymentId:     payment._id,
      bookingId:     booking.bookingId,
      keyId:         process.env.RAZORPAY_KEY_ID,
      prefill: {
        name:    `${req.user.firstName} ${req.user.lastName}`,
        email:   req.user.email,
        contact: req.user.phone || ''
      },
      notes: order.notes,
      theme: { color: '#B8960C' }
    }
  });
};

// ─── POST /api/payments/verify ──────────────────────────────────
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDbId, bookingId } = req.body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await Payment.findByIdAndUpdate(paymentDbId, { status: 'failed', failureReason: 'Signature mismatch' });
    return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
  }

  // Fetch payment details from Razorpay
  const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);

  // Update payment record
  const payment = await Payment.findByIdAndUpdate(paymentDbId, {
    'razorpay.paymentId':  razorpay_payment_id,
    'razorpay.signature':  razorpay_signature,
    status:  'captured',
    method:  rzpPayment.method,
    paidAt:  new Date(),
    metadata: rzpPayment
  }, { new: true });

  // Generate invoice number
  if (!payment.invoiceNumber) {
    const ts = Date.now().toString().slice(-6);
    payment.invoiceNumber = `INV-LXE-${ts}`;
    await payment.save();
  }

  // Update booking
  const booking = await Booking.findById(bookingId)
    .populate('event', 'title')
    .populate('user', 'firstName email');

  if (booking) {
    booking.payment = payment._id;
    booking.paymentStatus = payment.paymentType === 'full' ? 'paid' : 'partial';
    booking.advanceAmount = payment.amount;
    if (booking.status === 'pending') {
      booking.status = 'confirmed';
      booking.timeline.push({
        status: 'confirmed',
        note:   `Payment of ₹${payment.amount.toLocaleString()} received. Invoice #${payment.invoiceNumber}`,
        updatedBy: req.user.id
      });
    }
    await booking.save();

    // Send confirmation email
    try {
      await sendEmail({
        to: booking.user.email,
        subject: `Payment Successful — Invoice #${payment.invoiceNumber}`,
        template: 'paymentSuccess',
        data: {
          name:          booking.user.firstName,
          bookingId:     booking.bookingId,
          invoiceNumber: payment.invoiceNumber,
          amount:        payment.amount,
          eventName:     booking.event.title,
          paymentDate:   new Date().toLocaleDateString('en-IN')
        }
      });
    } catch (err) {
      logger.warn(`Payment confirmation email failed: ${err.message}`);
    }
  }

  res.json({
    success: true,
    message: 'Payment verified and confirmed',
    data: {
      paymentId:     payment._id,
      razorpayId:    razorpay_payment_id,
      invoiceNumber: payment.invoiceNumber,
      amount:        payment.amount,
      status:        payment.status
    }
  });
};

// ─── GET /api/payments/history ──────────────────────────────────
exports.getPaymentHistory = async (req, res) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate({ path: 'booking', populate: { path: 'event', select: 'title category' } })
    .sort('-createdAt');

  res.json({ success: true, count: payments.length, data: payments });
};

// ─── GET /api/payments/:id/invoice ─────────────────────────────
exports.getInvoice = async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate({ path: 'booking', populate: [{ path: 'event', select: 'title category' }, { path: 'venue', select: 'name location' }] })
    .populate('user', 'firstName lastName email phone address');

  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

  if (payment.user._id.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, data: payment });
};
