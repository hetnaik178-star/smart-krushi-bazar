const express = require('express');
const router = express.Router();
const { getCropRecommendations, getAllSupportedCrops } = require('../controllers/recommendationController');

// Public endpoints
router.post('/crop', getCropRecommendations);
router.get('/crops', getAllSupportedCrops);

module.exports = router;
