const express = require('express');
const {
  bookConsultation,
  getMyConsultations,
  getConsultationById,
  updateConsultationStatus
} = require('../controllers/consultationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('image'), bookConsultation);
router.get('/', protect, getMyConsultations);
router.get('/expert', protect, getMyConsultations);
router.get('/:id', protect, getConsultationById);
router.put('/:id/status', protect, updateConsultationStatus);
router.put('/:id/:action', protect, updateConsultationStatus);

module.exports = router;
