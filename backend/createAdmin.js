const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_krushi_bazar';
    await mongoose.connect(mongoURI);
    const adminExists = await User.findOne({ email: 'admin@krushi.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@krushi.com',
        password: 'Admin@123',
        role: 'Admin',
        phone: '9999999999',
        location: 'Headquarters'
      });
      console.log('✅ Admin created successfully! Email: admin@krushi.com | Pass: Admin@123');
    } else {
      console.log('ℹ️ Admin already exists.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
