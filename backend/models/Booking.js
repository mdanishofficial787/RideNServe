const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    passengerType: {
      type: String,
      required: true,
      trim: true
    },
    tripFrom: {
      type: String,
      required: true,
      trim: true
    },
    tripTo: {
      type: String,
      required: true,
      trim: true
    },
    preferredTiming: {
      type: String,
      required: true,
      trim: true
    },
    carType: {
      type: String,
      required: true,
      trim: true
    },
    budget: {
      type: Number,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true
    },
    dropLocation: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
