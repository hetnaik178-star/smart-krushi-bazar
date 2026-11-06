const express = require('express');
const {
  createReview,
  getProductReviews,
  getFarmerReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, roleCheck(['Buyer', 'Admin']), createReview);
router.get('/product/:productId', getProductReviews);
router.get('/farmer/:farmerId', getFarmerReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
