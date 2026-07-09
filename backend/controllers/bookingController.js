const Booking = require('../models/Booking');

// @route  POST /api/bookings
// @desc   Create a new booking request
exports.createBooking = async (req, res) => {
  try {
    const {
      passengerType,
      tripFrom,
      tripTo,
      preferredTiming,
      carType,
      budget,
      phoneNumber,
      pickupLocation,
      dropLocation
    } = req.body;

    if (
      !passengerType ||
      !tripFrom ||
      !tripTo ||
      !preferredTiming ||
      !carType ||
      !budget ||
      !phoneNumber ||
      !pickupLocation ||
      !dropLocation
    ) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const booking = await Booking.create({
      passengerType,
      tripFrom,
      tripTo,
      preferredTiming,
      carType,
      budget,
      phoneNumber,
      pickupLocation,
      dropLocation
    });

    res.status(201).json({ success: true, message: 'Booking submitted successfully', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Server error while submitting booking' });
  }
};

// @route  GET /api/bookings
// @desc   Get all bookings (latest first)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching bookings' });
  }
};
