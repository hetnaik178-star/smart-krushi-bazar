const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'System', link = null) => {
  try {
    await Notification.create({ userId, title, message, type, link });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = { createNotification };
