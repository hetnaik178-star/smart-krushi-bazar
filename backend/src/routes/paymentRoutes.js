const express = require('express');
const {
  createOrder,
  verifyPayment,
  handleFailure,
  getAllPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/failed', protect, handleFailure);
router.get('/', protect, roleCheck(['Admin']), getAllPayments);

module.exports = router;
