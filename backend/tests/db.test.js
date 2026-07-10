jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: { readyState: 0 }
}));

const mongoose = require('mongoose');
const connectDB = require('../config/db');

describe('connectDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongoose.connection.readyState = 0;
  });

  test('does not reconnect when MongoDB is already connected', async () => {
    mongoose.connection.readyState = 1;

    await connectDB();

    expect(mongoose.connect).not.toHaveBeenCalled();
  });
});
