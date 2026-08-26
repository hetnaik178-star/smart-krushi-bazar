const express = require('express');
const { getFarmerAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/farmer', protect, roleCheck(['Farmer']), getFarmerAnalytics);
router.get('/admin', protect, roleCheck(['Admin']), getAdminAnalytics);

module.exports = router;
