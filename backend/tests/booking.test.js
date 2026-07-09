jest.mock('../config/db', () => jest.fn().mockResolvedValue());
jest.mock('../models/Booking');

const request = require('supertest');
const Booking = require('../models/Booking');
const app = require('../app');

const validPayload = {
  passengerType: '1 Male',
  tripFrom: 'Bahria Town',
  tripTo: 'F-10',
  preferredTiming: 'Mon-Sat 08:30am - 03:30pm',
  carType: 'Suzuki',
  budget: 1000,
  phoneNumber: '03001234567',
  pickupLocation: 'Lahore',
  dropLocation: 'Karachi'
};

describe('Booking API', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('POST /api/bookings creates a booking with valid data', async () => {
    Booking.create.mockResolvedValue({ _id: 'abc123', ...validPayload });

    const res = await request(app).post('/api/bookings').send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking).toMatchObject(validPayload);
    expect(Booking.create).toHaveBeenCalledWith(validPayload);
  });

  test('POST /api/bookings rejects when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ passengerType: '1 Male' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Booking.create).not.toHaveBeenCalled();
  });

  test('POST /api/bookings returns 500 if the database call fails', async () => {
    Booking.create.mockRejectedValue(new Error('DB write failed'));

    const res = await request(app).post('/api/bookings').send(validPayload);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/bookings returns the list of bookings', async () => {
    const mockBookings = [{ _id: '1', ...validPayload }];
    Booking.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockBookings) });

    const res = await request(app).get('/api/bookings');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bookings).toEqual(mockBookings);
  });

  test('GET /api/bookings returns 500 on database error', async () => {
    Booking.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB down')) });

    const res = await request(app).get('/api/bookings');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
