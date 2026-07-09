const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      // not required for google-only accounts
      select: false
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      default: null
    },
    picture: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
