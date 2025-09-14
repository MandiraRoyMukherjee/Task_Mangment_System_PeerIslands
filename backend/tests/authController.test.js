const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const User = require('../models/userModel');
const authController = require('../controllers/authController');

const app = express();
app.use(express.json());
app.post('/register', authController.register);
app.post('/login', authController.login);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      bcrypt.hashSync.mockReturnValue('hashedPassword');
      User.create.mockImplementation((name, email, password, callback) => {
        callback(null, { insertId: 1 });
      });

      const response = await request(app)
        .post('/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 8);
      expect(User.create).toHaveBeenCalledWith('John Doe', 'john@example.com', 'hashedPassword', expect.any(Function));
    });

    it('should handle registration error', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      bcrypt.hashSync.mockReturnValue('hashedPassword');
      User.create.mockImplementation((name, email, password, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/register')
        .send(userData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const userData = {
        name: 'John Doe'
      };

      const response = await request(app)
        .post('/register')
        .send(userData);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword'
      };

      User.findByEmail.mockImplementation((email, callback) => {
        callback(null, [mockUser]);
      });
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mockToken');
      expect(response.body.user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, 'secret123', { expiresIn: '1h' });
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      User.findByEmail.mockImplementation((email, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .post('/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword'
      };

      User.findByEmail.mockImplementation((email, callback) => {
        callback(null, [mockUser]);
      });
      bcrypt.compareSync.mockReturnValue(false);

      const response = await request(app)
        .post('/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle database error during login', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      User.findByEmail.mockImplementation((email, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});