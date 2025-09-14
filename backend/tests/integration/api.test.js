const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

jest.mock('../config/db');

const db = require('../config/db');

const authRoutes = require('../../routes/authRoutes');
const taskRoutes = require('../../routes/taskRoutes');
const notificationRoutes = require('../../routes/notificationRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1 };
  next();
};

app.use('/api/auth', authRoutes);
app.use('/api/tasks', mockAuthMiddleware, taskRoutes);
app.use('/api/notifications', mockAuthMiddleware, notificationRoutes);

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, { insertId: 1 });
      });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.message).toBe('User registered successfully');

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2a$08$hashedpassword'
      };

      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, [mockUser]);
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });

  describe('Task Management Flow', () => {
    it('should complete full task CRUD flow', async () => {
      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, { insertId: 1 });
      });

      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'To Do',
          priority: 'High',
          category: 'Work',
          start_date: '2024-01-01 09:00:00',
          due_date: '2024-01-01 17:00:00'
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.message).toBe('Task created successfully');
      expect(createResponse.body.taskId).toBe(1);

      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'To Do',
          priority: 'High',
          category: 'Work',
          user_id: 1
        }
      ];

      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, mockTasks);
      });

      const getResponse = await request(app)
        .get('/api/tasks');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveLength(1);
      expect(getResponse.body[0].title).toBe('Test Task');

      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const updateResponse = await request(app)
        .put('/api/tasks/1')
        .send({
          status: 'In Progress'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.message).toBe('Task updated successfully');

      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const deleteResponse = await request(app)
        .delete('/api/tasks/1');

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Task deleted');
    });
  });

  describe('Notification Flow', () => {
    it('should get notifications for overdue and urgent tasks', async () => {
      const mockNotifications = [
        {
          id: 1,
          title: 'Overdue Task',
          description: 'This task is overdue',
          due_date: '2024-01-01 10:00:00',
          priority: 'High',
          status: 'To Do',
          category: 'Work',
          notification_type: 'overdue',
          minutes_until_due: -30
        },
        {
          id: 2,
          title: 'Urgent Task',
          description: 'This task is due soon',
          due_date: '2024-01-01 12:30:00',
          priority: 'High',
          status: 'In Progress',
          category: 'Personal',
          notification_type: 'urgent',
          minutes_until_due: 15
        }
      ];

      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, mockNotifications);
      });

      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].type).toBe('overdue');
      expect(response.body.data[1].type).toBe('urgent');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should handle invalid task ID', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });

    it('should handle invalid credentials', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields for task creation', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          description: 'Test Description'
        });

      expect(response.status).toBe(500);
    });

    it('should validate required fields for user registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe'
        });

      expect(response.status).toBe(500);
    });
  });
});