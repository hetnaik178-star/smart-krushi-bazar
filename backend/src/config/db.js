const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_krushi_bazar';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`⚠️ Could not connect to local MongoDB database at ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_krushi_bazar'}.`);
    console.error(`💡 Please ensure MongoDB Community Server is installed and running on your machine.`);
    throw error;
  }
};

module.exports = connectDB;
