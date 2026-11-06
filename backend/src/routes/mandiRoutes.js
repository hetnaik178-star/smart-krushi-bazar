const express = require('express');
const { getMandiPrices, getMandiLocations, getMandiTrend } = require('../controllers/mandiController');

const router = express.Router();

router.get('/', getMandiPrices);
router.get('/locations', getMandiLocations);
router.get('/trend', getMandiTrend);

module.exports = router;
