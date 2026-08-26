const users = {}; // { userId: socketId }
const Conversation = require('../models/Chat');
const Notification = require('../models/Notification');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('⚡ Socket client connected:', socket.id);

    socket.on('register', (userId) => {
      if (userId) {
        users[userId] = socket.id;
        console.log(`👤 User registered to socket: ${userId} -> ${socket.id}`);
      }
    });

    socket.on('send_message', async (data) => {
      const { conversationId, receiverId, message } = data;

      // 1. Persist notification to DB (survives page refresh)
      try {
        if (receiverId) {
          await Notification.create({
            userId: receiverId,
            title: `New message from ${message.senderName || message.senderId?.name || 'User'}`,
            message: message.text || (message.imageUrl ? '📷 Image Attachment' : 'New Message'),
            type: 'Message',
            link: '/chat',
            isRead: false
          });
        }
      } catch (e) {
        console.error('Notification DB save error:', e.message);
      }

      // 2. Emit real-time to receiver if online
      const receiverSocketId = users[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', message);
        io.to(receiverSocketId).emit('notification_update', {
          type: 'Message',
          title: `New message from ${message.senderName || message.senderId?.name || 'User'}`,
          preview: message.text || (message.imageUrl ? '📷 Image Attachment' : 'New Message'),
          time: message.createdAt || new Date().toISOString(),
        });
        io.to(receiverSocketId).emit('new_message_notification', {
          conversationId,
          senderName: message.senderName || message.senderId?.name || 'User',
          preview: message.text || (message.imageUrl ? '📷 Image Attachment' : 'New Message'),
          time: message.createdAt || new Date().toISOString(),
        });
      }
    });

    socket.on('mark_read', async (data) => {
      const { conversationId, readerId } = data;
      try {
        if (Conversation && conversationId) {
          await Conversation.updateMany(
            { _id: conversationId, 'messages.senderId': { $ne: readerId }, 'messages.isRead': false },
            { $set: { 'messages.$[elem].isRead': true } },
            { arrayFilters: [{ 'elem.senderId': { $ne: readerId }, 'elem.isRead': false }] }
          );
        }
      } catch (e) {
        console.error('mark_read error:', e);
      }
    });

    socket.on('typing', (data) => {
      const { receiverId, isTyping, senderId } = data;
      const receiverSocketId = users[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { senderId, isTyping });
      }
    });

    socket.on('disconnect', () => {
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          console.log(`🔌 User disconnected from socket: ${userId}`);
          break;
        }
      }
    });
  });
};

module.exports = setupSocket;
