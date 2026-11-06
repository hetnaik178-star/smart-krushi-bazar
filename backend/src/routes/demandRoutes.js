const express = require('express');
const {
  createDemand,
  getMyDemands,
  getActiveDemands,
  updateDemandStatus,
  deleteDemand
} = require('../controllers/demandController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/active', getActiveDemands);
router.get('/my', protect, getMyDemands);
router.post('/', protect, createDemand);
router.patch('/:id/status', protect, updateDemandStatus);
router.delete('/:id', protect, deleteDemand);

module.exports = router;
