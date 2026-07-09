const express = require('express');
const router = express.Router();
const { createPreBooking, getPreBookings } = require('../controllers/preBookingController');

router.post('/', createPreBooking);
router.get('/', getPreBookings);

module.exports = router;
