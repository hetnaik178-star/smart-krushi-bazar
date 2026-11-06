const express = require('express');
const {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus,
  initiateOrder,
  getOrderById
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
router.get('/:id', getOrderById); // Public route for Digital Passport QR Scan verification
router.put('/:id/status', protect, roleCheck(['Farmer', 'Admin']), updateOrderStatus);
router.patch('/:id/status', protect, roleCheck(['Farmer', 'Admin']), updateOrderStatus);
router.patch('/:id/tracking', protect, roleCheck(['Farmer', 'Admin']), updateOrderStatus);

module.exports = router;
