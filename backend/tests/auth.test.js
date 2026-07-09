jest.mock('../config/db', () => jest.fn().mockResolvedValue());
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('../utils/generateOTP', () => jest.fn(() => '123456'));
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue());

const request = require('supertest');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const app = require('../app');

describe('Auth API', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    test('rejects missing fields', async () => {
      const res = await request(app).post('/api/auth/signup').send({ email: 'a@a.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('rejects password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Ali', email: 'a@a.com', password: '123' });

      expect(res.statusCode).toBe(400);
    });

    test('blocks signup when a verified account already exists', async () => {
      User.findOne.mockResolvedValue({ isVerified: true });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Ali', email: 'a@a.com', password: '123456' });

      expect(res.statusCode).toBe(409);
    });

    test('creates a new user and sends an OTP email', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      User.create.mockResolvedValue({ _id: '1', email: 'a@a.com', name: 'Ali' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Ali', email: 'a@a.com', password: '123456' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(User.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/auth/login', () => {
    test('rejects missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com' });
      expect(res.statusCode).toBe(400);
    });

    test('rejects an unknown email', async () => {
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@a.com', password: '123456' });

      expect(res.statusCode).toBe(401);
    });

    test('rejects an incorrect password', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ provider: 'local', password: 'hashed-password' })
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@a.com', password: 'wrong-password' });

      expect(res.statusCode).toBe(401);
    });

    test('blocks login for an unverified account', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          provider: 'local',
          password: 'hashed-password',
          isVerified: false,
          email: 'a@a.com'
        })
      });
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@a.com', password: '123456' });

      expect(res.statusCode).toBe(403);
      expect(res.body.needsVerification).toBe(true);
    });
  });
});
