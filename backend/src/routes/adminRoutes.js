const express = require('express');
const {
  getAllUsers,
  getAllProducts,
  getAllOrders,
  deleteAnyProduct,
  deleteAnyUser,
  exportUsersCSV,
  exportSalesCSV,
  seedDemo
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(protect, roleCheck(['Admin']));

router.get('/users', getAllUsers);
router.get('/products', getAllProducts);
router.get('/orders', getAllOrders);
router.get('/export/users', exportUsersCSV);
router.get('/export/orders', exportSalesCSV);
router.post('/seed-demo', seedDemo);
router.delete('/products/:id', deleteAnyProduct);
router.delete('/users/:id', deleteAnyUser);

module.exports = router;
