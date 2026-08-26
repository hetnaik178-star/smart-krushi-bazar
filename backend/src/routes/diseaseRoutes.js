const express = require('express');
const { predictDisease } = require('../controllers/diseaseController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/detect', protect, upload.single('image'), predictDisease);

module.exports = router;
