require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSocket = require('./utils/socket');

const User = require('./models/User');
const { restoreDatabase } = require('./utils/restoreDatabase');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-initialize empty database from project backup files (e.g. fresh pen drive run on another PC)
    try {
      const usersCount = await User.countDocuments();
      if (usersCount === 0) {
        console.log('⚡ Empty database detected on startup. Auto-restoring full platform data from database/collections/...');
        await restoreDatabase({ clearExisting: false });
      }
    } catch (dbInitErr) {
      console.warn('⚠️ Auto-restore check skipped:', dbInitErr.message);
    }

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
      }
    });

    setupSocket(io);
    app.set('io', io);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server + Socket.io running on port ${PORT} (0.0.0.0)`);
    });
  } catch (error) {
    console.error(`💥 Server startup aborted:`, error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

startServer();
