const express = require('express');
const {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus,
  initiateOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/', protect, roleCheck(['Buyer']), createOrder);
router.post('/initiate', protect, roleCheck(['Buyer']), initiateOrder);
router.get('/my', protect, roleCheck(['Buyer']), getMyOrders);
router.get('/my-orders', protect, roleCheck(['Buyer']), getMyOrders);
router.get('/received', protect, roleCheck(['Farmer']), getReceivedOrders);
router.get('/farmer-orders', protect, roleCheck(['Farmer']), getReceivedOrders);
router.put('/:id/status', protect, roleCheck(['Farmer']), updateOrderStatus);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;
