const mongoose = require('mongoose');
const dns = require('dns');

// Force Node to use Google's public DNS for lookups (fixes querySrv ECONNREFUSED
// on networks/ISPs that block or mishandle DNS SRV record queries)
dns.setServers(['8.8.8.8', '8.8.4.4']);

let isConnected = false;
let connectPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  connectPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10
  })
    .then((conn) => {
      isConnected = true;
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((err) => {
      connectPromise = null;
      console.error('MongoDB connection error:', err.message);
      throw err;
    });

  return connectPromise;
}

module.exports = connectDB;
