const express = require('express');
const { getFarmerWeather, getLiveWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Public live GPS weather route for Header and home widgets
router.get('/live', getLiveWeather);

// Authenticated farmer advisory weather route
router.get('/', protect, getFarmerWeather);

module.exports = router;
