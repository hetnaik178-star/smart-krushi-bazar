const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Farmer', 'Buyer', 'Admin', 'Expert'], required: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  
  // Profile fields
  profileImage: { type: String, default: null },
  bio: { type: String, default: '', maxlength: 500 },
  
  // Farmer-specific fields
  farmName: { type: String, default: '', trim: true },
  specialization: { type: String, default: '', trim: true },

  // Expert-specific fields
  qualification: { type: String, default: '', trim: true },
  experienceYears: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 0 },
  availableDays: [{ type: String }], // e.g. ['Monday', 'Wednesday', 'Friday']
  availableSlots: [{ type: String }], // e.g. ['10:00 AM - 11:00 AM', '02:00 PM - 03:00 PM']
  isExpertVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.virtual('joinedDate').get(function () {
  return this.createdAt;
});

module.exports = mongoose.model('User', userSchema);
