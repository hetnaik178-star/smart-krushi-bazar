const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  getProfileStats
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', protect, getMyProfile);
router.put('/', protect, updateMyProfile);
router.put('/photo', protect, upload.single('profileImage'), uploadProfilePhoto);
router.delete('/photo', protect, removeProfilePhoto);
router.get('/stats', protect, getProfileStats);

module.exports = router;
