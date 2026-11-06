const mongoose = require('mongoose');

const demandSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, default: '' },
  cropName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Other'], 
    default: 'Vegetables' 
  },
  quantity: { type: Number, required: true, min: 1 },
  unit: { 
    type: String, 
    enum: ['kg', 'Quintal', 'Tonne', 'Crates', 'Bags'], 
    default: 'kg' 
  },
  targetPrice: { type: Number, required: true, min: 1 }, // Target budget per unit in INR
  deliveryLocation: { type: String, required: true },
  requiredByDate: { type: Date, required: true },
  qualityNotes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Active', 'In Negotiation', 'Fulfilled', 'Closed'], 
    default: 'Active' 
  },
  responsesCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Demand', demandSchema);
