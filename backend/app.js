const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const preBookingRoutes = require('./routes/preBookingRoutes');

const app = express();

// Middleware
app.use(compression());
app.use(express.json());

const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// Initialize the database connection once when the app starts.
// This avoids the extra latency on login/signup requests.
connectDB().catch((err) => {
  console.error('Initial database connection failed:', err.message);
});

// Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Ride and Serve API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/prebookings', preBookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
