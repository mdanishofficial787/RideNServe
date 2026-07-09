const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const sendOTPEmail = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    picture: user.picture || '',
    isVerified: user.isVerified
  };
}

// @route POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing && existing.isVerified) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    if (existing && !existing.isVerified) {
      // Re-signup attempt before verifying - update details & resend OTP
      existing.name = name;
      existing.password = hashedPassword;
      existing.otp = { code: otp, expiresAt: otpExpiresAt };
      user = await existing.save();
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        provider: 'local',
        isVerified: false,
        otp: { code: otp, expiresAt: otpExpiresAt }
      });
    }

    await sendOTPEmail(user.email, user.name, otp);

    return res.status(201).json({
      success: true,
      message: 'Account created. Please verify the OTP sent to your email.',
      email: user.email
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

// @route POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp.code +otp.expiresAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account already verified' });
    }
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ success: false, message: 'No OTP found, please request a new one' });
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired, please request a new one' });
    }
    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: publicUser(user)
    });
  } catch (err) {
    console.error('OTP verify error:', err);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// @route POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account already verified' });
    }

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await sendOTPEmail(user.email, user.name, otp);

    return res.status(200).json({ success: true, message: 'OTP resent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ success: false, message: 'Server error while resending OTP' });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || user.provider !== 'local' || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @route POST /api/auth/google
// body: { credential } -> the ID token from Google Identity Services
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ success: false, message: 'Google email not verified' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link google to an existing local account, or just log them in
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = user.provider === 'local' ? user.provider : 'google';
        user.picture = user.picture || picture || '';
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        provider: 'google',
        picture: picture || '',
        isVerified: true
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Google sign-in successful',
      token,
      user: publicUser(user)
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(401).json({ success: false, message: 'Invalid Google credential' });
  }
};

// @route GET /api/auth/me (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
