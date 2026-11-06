const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve local static uploaded files if fallback is used
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Core & V2 Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// V3 Routes
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Profile & Identity Routes
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/farmers', require('./routes/farmerRoutes'));

// V4 Feature Modules
app.use('/api/experts', require('./routes/expertRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/mandi', require('./routes/mandiRoutes'));
app.use('/api/disease', require('./routes/diseaseRoutes'));
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/recommendation', require('./routes/recommendationRoutes'));
app.use('/api/demands', require('./routes/demandRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

const os = require('os');

app.get('/api/network-info', (req, res) => {
  try {
    const nets = os.networkInterfaces();
    let networkIp = 'localhost';
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          networkIp = net.address;
          break;
        }
      }
      if (networkIp !== 'localhost') break;
    }
    res.json({ networkIp, port: process.env.PORT || 5000 });
  } catch (e) {
    res.json({ networkIp: 'localhost' });
  }
});

app.get('/', (req, res) => res.json({ message: 'Smart Krushi Bazar API is running!' }));

module.exports = app;
