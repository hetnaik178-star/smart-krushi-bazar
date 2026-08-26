const express = require('express');
const { getConversations, getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/messages/:receiverId', protect, getMessages);
router.post('/send', protect, upload.single('image'), sendMessage);

module.exports = router;
