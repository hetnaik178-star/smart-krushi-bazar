const express = require('express');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', protect, roleCheck(['Buyer']), getWishlist);
router.post('/:productId', protect, roleCheck(['Buyer']), addToWishlist);
router.delete('/:productId', protect, roleCheck(['Buyer']), removeFromWishlist);

module.exports = router;
