const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  problemDescription: { type: String, required: true },
  imageUrl: { type: String, default: null },
  fee: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'], default: 'Pending' },
  
  // Payment tracking
  paymentMethod: { type: String, enum: ['Razorpay', 'COD', 'Free'], default: 'Razorpay' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'COD', 'Free'], default: 'Pending' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  expertNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
