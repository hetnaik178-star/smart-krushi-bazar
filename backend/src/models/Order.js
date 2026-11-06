const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: '' },
  farmPhoto: { type: String, default: '' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  produceAmount: { type: Number, default: 0 },
  freightAmount: { type: Number, default: 0 },
  vehicleType: { type: String, default: 'Standard Farm Express' },
  isBulkOrder: { type: Boolean, default: false },
  deliveryDistanceKm: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Accepted', 'Completed', 'Cancelled', 'Rejected'], default: 'Pending' },
  trackingStatus: {
    type: String,
    enum: ['ORDER_PLACED', 'HARVEST_PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
    default: 'ORDER_PLACED'
  },
  packedAt: { type: Date, default: null },
  dispatchedAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  
  // === PAYMENT FIELDS ===
  paymentMethod: { type: String, enum: ['Razorpay', 'COD', 'Pending', 'Free'], default: 'Razorpay' },
  paymentProvider: { type: String, default: null }, // 'Razorpay' or null for COD
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'COD', 'Free'], default: 'Pending' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  verifiedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
