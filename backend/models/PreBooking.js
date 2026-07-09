const mongoose = require('mongoose');

const preBookingSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    cnic: {
      type: String,
      required: true,
      trim: true
    },
    preferredTime: {
      type: String,
      required: true,
      trim: true
    },
    preferredDate: {
      type: Date,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PreBooking', preBookingSchema, 'Pre booking');
