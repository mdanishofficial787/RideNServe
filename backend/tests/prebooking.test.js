jest.mock('../config/db', () => jest.fn().mockResolvedValue());
jest.mock('../models/PreBooking');

const request = require('supertest');
const PreBooking = require('../models/PreBooking');
const app = require('../app');

const validPayload = {
  fullName: 'Ali Khan',
  cnic: '12345-1234567-1',
  preferredDate: '2026-08-01',
  preferredTime: '14:30',
  totalAmount: 1500
};

describe('PreBooking API', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('POST /api/prebookings creates a pre-booking with valid data', async () => {
    PreBooking.create.mockResolvedValue({ _id: 'abc123', ...validPayload });

    const res = await request(app).post('/api/prebookings').send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(PreBooking.create).toHaveBeenCalledTimes(1);
  });

  test('POST /api/prebookings rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/prebookings')
      .send({ fullName: 'Ali Khan' });

    expect(res.statusCode).toBe(400);
    expect(PreBooking.create).not.toHaveBeenCalled();
  });

  test('POST /api/prebookings rejects an invalid CNIC format', async () => {
    const res = await request(app)
      .post('/api/prebookings')
      .send({ ...validPayload, cnic: '12345678901' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/CNIC/i);
    expect(PreBooking.create).not.toHaveBeenCalled();
  });

  test('POST /api/prebookings rejects a non-positive amount', async () => {
    const res = await request(app)
      .post('/api/prebookings')
      .send({ ...validPayload, totalAmount: 0 });

    expect(res.statusCode).toBe(400);
    expect(PreBooking.create).not.toHaveBeenCalled();
  });

  test('GET /api/prebookings returns the list of pre-bookings', async () => {
    const mockData = [{ _id: '1', ...validPayload }];
    PreBooking.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockData) });

    const res = await request(app).get('/api/prebookings');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.preBookings).toEqual(mockData);
  });
});
