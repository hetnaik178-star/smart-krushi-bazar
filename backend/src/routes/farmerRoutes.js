const express = require('express');
const { getPublicFarmerProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/:id', getPublicFarmerProfile);

module.exports = router;
