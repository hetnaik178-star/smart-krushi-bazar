const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['product', 'cart', 'consultation'], required: true },
  paymentMethod: { type: String, enum: ['Razorpay', 'COD'], default: 'Razorpay' },
  paymentProvider: { type: String, default: null },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: { type: String, index: true, sparse: true },
  razorpayPaymentId: { type: String, sparse: true },
  razorpaySignature: { type: String },
  status: { type: String, enum: ['Created', 'Pending', 'Paid', 'Failed', 'Verification_Failed'], default: 'Created' },
  orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  error: { type: String, default: null },
  paidAt: { type: Date, default: null },
  verifiedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
