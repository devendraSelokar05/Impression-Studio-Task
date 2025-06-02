
const request = require('supertest');
const app = require('../../app'); 
const User = require('../../models/postgres/user.model');
const jwt = require('jsonwebtoken');
const  sequelize  = require('../../config/postgres'); 

// Mock console.log to avoid cluttering test output
console.log = jest.fn();
console.error = jest.fn();

describe('User Controller - Integration Tests', () => {
  let testUser, authToken;

  beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
    await sequelize.sync();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.destroy({ where: {}, truncate: true });
    jest.clearAllMocks();
    
    // Create a test user for authenticated routes
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      city: 'Mumbai',
      otp: 123456,
      isVerified: true
    });

    // Generate auth token
    authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET || 'test-secret');
  });

  

  describe('POST /api/auth/register', () => {
    const validUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      city: 'Mumbai'
    };

    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'user registered. OTP sent to email.',
        user: expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          city: 'Mumbai',
          otp: expect.any(Number),
          isVerified: false
        })
      });

      // Verify user is created in database
      const userInDb = await User.findOne({ where: { email: 'john@example.com' } });
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe('John Doe');
      expect(userInDb.isVerified).toBe(false);
      expect(userInDb.otp).toBeGreaterThanOrEqual(100000);
      expect(userInDb.otp).toBeLessThanOrEqual(999999);
    });

    test('should return 400 for missing required fields', async () => {
      const { name, ...invalidData } = validUserData;

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'All fields are required'
      });
    });

    test('should return 409 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body).toEqual({
        message: 'Email already registered'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with verified user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Login successful. Welcome back'),
        token: expect.any(String),
        user: expect.objectContaining({
          id: testUser.id,
          email: 'test@example.com'
        })
      });

      // Verify JWT token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.id).toBe(testUser.id);
    });

    test('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toEqual({
        message: 'All fields are required'
      });
    });

    test('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
    });

    test('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
    });

    test('should return 403 for unverified user', async () => {
      // Create unverified user
      await User.create({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: 'password123',
        role: 'user',
        city: 'Delhi',
        otp: 123456,
        isVerified: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'password123'
        })
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'User is not verified. Please complete OTP verification during registration.'
      });
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    let unverifiedUser;

    beforeEach(async () => {
      unverifiedUser = await User.create({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: 'password123',
        role: 'user',
        city: 'Delhi',
        otp: 123456,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        isVerified: false
      });
    });

    test('should verify OTP successfully', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'unverified@example.com',
          otp: '123456'
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'OTP verified successfully. User is now verified.'
      });

      // Verify user is updated in database
      const updatedUser = await User.findByPk(unverifiedUser.id);
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.otp).toBeNull();
      expect(updatedUser.otpExpiresAt).toBeNull();
    });

    test('should return 400 for missing email or OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'unverified@example.com' })
        .expect(400);

      expect(response.body).toEqual({
        message: 'Email and OTP are required'
      });
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'nonexistent@example.com',
          otp: '123456'
        })
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });

    test('should return 400 for invalid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'unverified@example.com',
          otp: '999999'
        })
        .expect(400);

      expect(response.body).toEqual({
        message: 'Invalid OTP'
      });
    });

    test('should return 400 for expired OTP', async () => {
      // Update user with expired OTP
      await User.update(
        { otpExpiresAt: new Date(Date.now() - 10 * 60 * 1000) }, // 10 minutes ago
        { where: { id: unverifiedUser.id } }
      );

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'unverified@example.com',
          otp: '123456'
        })
        .expect(400);

      expect(response.body).toEqual({
        message: 'OTP has expired'
      });
    });
  });

  describe('POST /api/auth/resend-otp', () => {
    let unverifiedUser;

    beforeEach(async () => {
      unverifiedUser = await User.create({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: 'password123',
        role: 'user',
        city: 'Delhi',
        otp: 123456,
        isVerified: false
      });
    });

    test('should resend OTP successfully', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: 'unverified@example.com' })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'OTP resent to your email',
        otp: expect.any(Number)
      });

      // Verify OTP is updated in database
      const updatedUser = await User.findByPk(unverifiedUser.id);
      expect(updatedUser.otp).toBeGreaterThanOrEqual(100000);
      expect(updatedUser.otp).toBeLessThanOrEqual(999999);
      expect(updatedUser.otpExpiresAt).toBeInstanceOf(Date);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });

    test('should return 400 for already verified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: 'test@example.com' }) // verified user
        .expect(400);

      expect(response.body).toEqual({
        message: 'User is already verified'
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: expect.objectContaining({
          id: testUser.id,
          name: 'Test User',
          email: 'test@example.com'
        })
      });
    });

    test('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toEqual({
        message: 'Unauthorized'
      });
    });
  });
});