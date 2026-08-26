const express = require('express');
const { getMandiPrices, getMandiLocations } = require('../controllers/mandiController');

const router = express.Router();

router.get('/', getMandiPrices);
router.get('/locations', getMandiLocations);

module.exports = router;
