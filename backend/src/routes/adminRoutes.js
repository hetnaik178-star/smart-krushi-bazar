const express = require('express');
const { getAllUsers, getAllProducts, getAllOrders, deleteAnyProduct, deleteAnyUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(protect, roleCheck(['Admin']));

router.get('/users', getAllUsers);
router.get('/products', getAllProducts);
router.get('/orders', getAllOrders);
router.delete('/products/:id', deleteAnyProduct);
router.delete('/users/:id', deleteAnyUser);

module.exports = router;
