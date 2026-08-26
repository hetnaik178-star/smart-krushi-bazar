const express = require('express');
const { getExperts, getExpertById, updateExpertProfile } = require('../controllers/expertController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getExperts);
router.get('/:id', getExpertById);
router.put('/profile', protect, updateExpertProfile);

module.exports = router;
