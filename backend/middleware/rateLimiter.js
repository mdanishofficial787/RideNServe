const rateLimit = require('express-rate-limit');

// Prevents OTP spam - max 5 requests per 10 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please try again after some time.' },
  standardHeaders: true,
  legacyHeaders: false
});

// General auth rate limiter (login/signup) - max 20 requests per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { otpLimiter, authLimiter };
