const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms');
    console.log(`[Database] MongoDB Connected | Host: ${conn.connection.host} | Port: ${conn.connection.port} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
