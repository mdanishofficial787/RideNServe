const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  googleAuth,
  getMe
} = require('../controllers/authController');
const protect = require('../middleware/auth');
const { otpLimiter, authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signup);
router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
