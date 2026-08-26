const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getMyProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, roleCheck(['Farmer']), upload.single('image'), createProduct);

router.get('/my', protect, roleCheck(['Farmer']), getMyProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, roleCheck(['Farmer']), upload.single('image'), updateProduct)
  .delete(protect, roleCheck(['Farmer']), deleteProduct);

module.exports = router;
