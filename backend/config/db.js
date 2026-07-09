const mongoose = require('mongoose');
const dns = require('dns');

// Force Node to use Google's public DNS for lookups (fixes querySrv ECONNREFUSED
// on networks/ISPs that block or mishandle DNS SRV record queries)
dns.setServers(['8.8.8.8', '8.8.4.4']);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectDB;
