const PreBooking = require('../models/PreBooking');

// @route  POST /api/prebookings
// @desc   Create a new pre-booking request
exports.createPreBooking = async (req, res) => {
  try {
    const { fullName, cnic, preferredTime, preferredDate, totalAmount } = req.body;

    if (!fullName || !cnic || !preferredTime || !preferredDate || !totalAmount) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicPattern.test(cnic)) {
      return res.status(400).json({ success: false, message: 'CNIC must be in the format 00000-0000000-0' });
    }

    const amountValue = Number(totalAmount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ success: false, message: 'Total amount must be a valid positive number' });
    }

    const preBooking = await PreBooking.create({
      fullName,
      cnic,
      preferredTime,
      preferredDate,
      totalAmount: amountValue
    });

    res.status(201).json({ success: true, message: 'Pre-booking submitted successfully', preBooking });
  } catch (err) {
    console.error('Create pre-booking error:', err);
    res.status(500).json({ success: false, message: 'Server error while submitting pre-booking' });
  }
};

// @route  GET /api/prebookings
// @desc   Get all pre-bookings (latest first)
exports.getPreBookings = async (req, res) => {
  try {
    const preBookings = await PreBooking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, preBookings });
  } catch (err) {
    console.error('Get pre-bookings error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching pre-bookings' });
  }
};
