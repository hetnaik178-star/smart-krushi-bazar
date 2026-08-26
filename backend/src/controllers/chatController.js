const mongoose = require('mongoose');
const Conversation = require('../models/Chat');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get all conversations for logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email role profileImage farmName specialization qualification')
      .sort({ lastMessageTime: -1 });

    res.json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
  }
};

// @desc    Get messages for a conversation with a specific user OR conversationId
// @route   GET /api/chat/messages/:id
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const isValidId = mongoose.Types.ObjectId.isValid(receiverId);

    if (!isValidId) {
      return res.status(400).json({ success: false, message: 'Invalid ID supplied' });
    }

    // Try finding by conversation ID first, or by participants
    let conversation = await Conversation.findOne({
      $or: [
        { _id: receiverId, participants: req.user._id },
        { participants: { $all: [req.user._id, receiverId] } }
      ]
    }).populate('participants', 'name email role profileImage farmName specialization qualification');

    if (!conversation) {
      return res.json({ success: true, data: { messages: [], conversationId: null } });
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    let { receiverId, conversationId, text } = req.body;
    let imageUrl = null;

    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'smart_krushi_bazar/chat',
            resource_type: 'auto'
          });
          imageUrl = result.secure_url;
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (cErr) {
          imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
      } else {
        imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    let conversation = null;

    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findById(conversationId);
      if (conversation && !receiverId) {
        receiverId = conversation.participants.find(p => p.toString() !== req.user._id.toString());
      }
    }

    if (!conversation && receiverId && mongoose.Types.ObjectId.isValid(receiverId)) {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [req.user._id, receiverId],
          messages: []
        });
      }
    }

    if (!conversation) {
      return res.status(400).json({ success: false, message: 'Could not determine message conversation or recipient' });
    }

    const newMessage = {
      senderId: req.user._id,
      text: text || '',
      imageUrl: imageUrl || null,
      createdAt: new Date()
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = text || '📷 Photo';
    conversation.lastMessageTime = new Date();

    await conversation.save();

    // Persist Notification for receiver
    try {
      if (receiverId) {
        await Notification.create({
          userId: receiverId,
          title: `New message from ${req.user.name || 'User'}`,
          message: text || (imageUrl ? '📷 Image Attachment' : 'New Message'),
          type: 'Message',
          link: '/chat',
          isRead: false
        });
      }
    } catch (nErr) {
      console.error('Notification creation error in chat:', nErr.message);
    }

    const io = req.app.get('io');
    if (io && receiverId) {
      io.emit('new_message_notification', {
        receiverId: receiverId.toString(),
        senderId: req.user._id.toString(),
        senderName: req.user.name || 'User',
        message: newMessage,
        conversationId: conversation._id
      });
      io.emit('notification_update', {
        type: 'Message',
        title: `New message from ${req.user.name || 'User'}`,
        preview: text || (imageUrl ? '📷 Image Attachment' : 'New Message')
      });
    }

    res.status(201).json({ success: true, data: newMessage, conversationId: conversation._id });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage };
