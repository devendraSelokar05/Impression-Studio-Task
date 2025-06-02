// __tests__/unit/user.controller.unit.test.js
const {
    register,
    login,
    verifyOTP,
    resendOTP,
    getUserProfile,
  } = require('../../controllers/user.controller');
  const User = require('../../models/postgres/user.model');
  const jwt = require('jsonwebtoken');
  
  // Mock dependencies
  jest.mock('../../models/postgres/user.model');
  jest.mock('jsonwebtoken');
  
  // Mock console.log and console.error
  console.log = jest.fn();
  console.error = jest.fn();
  
  // Mock process.env
  process.env.JWT_SECRET = 'test-jwt-secret';
  
  describe('User Controller - Unit Tests', () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      
      req = {
        body: {},
        user: { id: 1 }
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });
  
    describe('Register Function', () => {
      beforeEach(() => {
        req.body = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'user',
          city: 'Mumbai'
        };
      });
  
      test('should register user successfully', async () => {
        User.findOne.mockResolvedValue(null);
        const mockUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          city: 'Mumbai',
          otp: expect.any(Number),
          isVerified: false
        };
        User.create.mockResolvedValue(mockUser);
  
        await register(req, res);
  
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
        expect(User.create).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'user',
          city: 'Mumbai',
          otp: expect.any(Number),
          isVerified: false
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'user registered. OTP sent to email.',
          user: mockUser
        });
      });
  
      test('should return 400 when required fields are missing', async () => {
        delete req.body.name;
  
        await register(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'All fields are required'
        });
        expect(User.findOne).not.toHaveBeenCalled();
      });
  
      test('should return 409 when email already exists', async () => {
        User.findOne.mockResolvedValue({ id: 1, email: 'john@example.com' });
  
        await register(req, res);
  
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Email already registered'
        });
        expect(User.create).not.toHaveBeenCalled();
      });
  
      test('should handle database errors', async () => {
        User.findOne.mockRejectedValue(new Error('Database error'));
  
        await register(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Database error'
        });
      });
    });
  
    describe('Login Function', () => {
      beforeEach(() => {
        req.body = {
          email: 'john@example.com',
          password: 'password123'
        };
      });
  
      test('should login successfully for verified user', async () => {
        const mockUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          isVerified: true,
          isValidPassword: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('mock-jwt-token');
  
        await login(req, res);
  
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
        expect(mockUser.isValidPassword).toHaveBeenCalledWith('password123');
        expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, 'test-jwt-secret', { expiresIn: '1d' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Login successful. Welcome back John Doe',
          token: 'mock-jwt-token',
          user: mockUser
        });
      });
  
      test('should return 400 when email or password is missing', async () => {
        delete req.body.email;
  
        await login(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'All fields are required'
        });
      });
  
      test('should return 401 when user not found', async () => {
        User.findOne.mockResolvedValue(null);
  
        await login(req, res);
  
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Invalid credentials'
        });
      });
  
      test('should return 401 when password is invalid', async () => {
        const mockUser = {
          id: 1,
          isValidPassword: jest.fn().mockResolvedValue(false)
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await login(req, res);
  
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Invalid credentials'
        });
      });
  
      test('should return 403 when user is not verified', async () => {
        const mockUser = {
          id: 1,
          isVerified: false,
          isValidPassword: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await login(req, res);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'User is not verified. Please complete OTP verification during registration.'
        });
      });
  
      test('should handle login errors', async () => {
        User.findOne.mockRejectedValue(new Error('Database error'));
  
        await login(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Database error'
        });
      });
    });
  
    describe('Verify OTP Function', () => {
      beforeEach(() => {
        req.body = {
          email: 'john@example.com',
          otp: '123456'
        };
      });
  
      test('should verify OTP successfully', async () => {
        const mockUser = {
          id: 1,
          email: 'john@example.com',
          otp: '123456',
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          isVerified: false,
          save: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await verifyOTP(req, res);
  
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
        expect(mockUser.isVerified).toBe(true);
        expect(mockUser.otp).toBe(null);
        expect(mockUser.otpExpiresAt).toBe(null);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'OTP verified successfully. User is now verified.'
        });
      });
  
      test('should return 400 when email or OTP is missing', async () => {
        delete req.body.email;
  
        await verifyOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Email and OTP are required'
        });
      });
  
      test('should return 404 when user not found', async () => {
        User.findOne.mockResolvedValue(null);
  
        await verifyOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: 'User not found'
        });
      });
  
      test('should return 400 when OTP is invalid', async () => {
        const mockUser = {
          otp: '654321'
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await verifyOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Invalid OTP'
        });
      });
  
      test('should return 400 when OTP is expired', async () => {
        const mockUser = {
          otp: '123456',
          otpExpiresAt: new Date(Date.now() - 10 * 60 * 1000) // expired
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await verifyOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'OTP has expired'
        });
      });
  
      test('should handle verification errors', async () => {
        User.findOne.mockRejectedValue(new Error('Database error'));
  
        await verifyOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Internal Server Error'
        });
      });
    });
  
    describe('Resend OTP Function', () => {
      beforeEach(() => {
        req.body = {
          email: 'john@example.com'
        };
      });
  
      test('should resend OTP successfully', async () => {
        const mockUser = {
          id: 1,
          email: 'john@example.com',
          isVerified: false,
          save: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await resendOTP(req, res);
  
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
        expect(mockUser.otp).toBeGreaterThanOrEqual(100000);
        expect(mockUser.otp).toBeLessThanOrEqual(999999);
        expect(mockUser.otpExpiresAt).toBeInstanceOf(Date);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: 'OTP resent to your email',
          otp: expect.any(Number)
        });
      });
  
      test('should return 404 when user not found', async () => {
        User.findOne.mockResolvedValue(null);
  
        await resendOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: 'User not found'
        });
      });
  
      test('should return 400 when user is already verified', async () => {
        const mockUser = {
          id: 1,
          isVerified: true
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await resendOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'User is already verified'
        });
      });
    });
  
    describe('Get User Profile Function', () => {
      beforeEach(() => {
        req.user = { id: 1 };
      });
  
      test('should get user profile successfully', async () => {
        const mockUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        };
        User.findByPk.mockResolvedValue(mockUser);
  
        await getUserProfile(req, res);
  
        expect(User.findByPk).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          user: mockUser
        });
      });
  
      test('should return 404 when user not found', async () => {
        User.findByPk.mockResolvedValue(null);
  
        await getUserProfile(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: 'User not found'
        });
      });
  
      test('should handle profile fetch errors', async () => {
        User.findByPk.mockRejectedValue(new Error('Database error'));
  
        await getUserProfile(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Database error'
        });
      });
    });
  
    
  
    describe('Edge Cases and Validation', () => {
      test('should handle string comparison for OTP verification', async () => {
        req.body = { email: 'john@example.com', otp: 123456 }; // number OTP
        const mockUser = {
          otp: '123456', // string OTP
          save: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await verifyOTP(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockUser.isVerified).toBe(true);
      });
  
      test('should handle undefined role in register message', async () => {
        req.body = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          city: 'Mumbai'
          // role is undefined
        };
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({});
  
        await register(req, res);
  
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'undefined registered. OTP sent to email.'
          })
        );
      });
  
      test('should generate different OTPs for multiple calls', async () => {
        const mockUser = {
          isVerified: false,
          save: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(mockUser);
  
        await resendOTP(req, res);
        const firstOTP = mockUser.otp;
  
        // Reset mock user
        mockUser.otp = undefined;
        await resendOTP(req, res);
        const secondOTP = mockUser.otp;
  
        expect(firstOTP).not.toBe(secondOTP);
      });
    });
  });