const express = require('express');
const {
  createDispute,
  getMyDisputes,
  getAllDisputes,
  resolveDispute
} = require('../controllers/disputeController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('image'), createDispute);
router.get('/my', protect, getMyDisputes);
router.get('/', protect, roleCheck(['Admin']), getAllDisputes);
router.put('/:id/resolve', protect, roleCheck(['Admin']), resolveDispute);

module.exports = router;
