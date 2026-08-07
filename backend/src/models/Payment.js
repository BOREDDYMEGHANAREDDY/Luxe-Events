const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true, required: true },
  booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  razorpay: {
    orderId:    { type: String, required: true },
    paymentId:  String,
    signature:  String,
  },
  amount:   { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'pending', 'captured', 'failed', 'refunded', 'partially-refunded'],
    default: 'created'
  },
  method:      String,  // card, netbanking, upi, wallet
  description: String,
  paymentType: { type: String, enum: ['advance', 'full', 'balance', 'refund'], default: 'advance' },
  refund: {
    refundId: String, amount: Number,
    reason: String, status: String, refundedAt: Date
  },
  invoiceNumber: { type: String, unique: true, sparse: true },
  metadata:  mongoose.Schema.Types.Mixed,
  failureReason: String,
  paidAt: Date
}, { timestamps: true });

paymentSchema.pre('validate', function (next) {
  if (!this.paymentId) {
    const ts = Date.now().toString().slice(-8);
    this.paymentId = `PAY${ts}`;
  }
  if (!this.invoiceNumber && this.status === 'captured') {
    const ts = Date.now().toString().slice(-6);
    this.invoiceNumber = `INV-LXE-${ts}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
