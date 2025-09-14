const request = require('supertest');
const express = require('express');

jest.mock('../config/db');

const db = require('../config/db');
const notificationController = require('../controllers/notificationController');

const app = express();
app.use(express.json());

const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1 };
  next();
};

app.get('/notifications', mockAuthMiddleware, notificationController.getNotifications);

describe('Notification Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /notifications', () => {
    it('should get notifications for overdue tasks', async () => {
      const mockTasks = [
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
        }
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('overdue');
      expect(response.body.data[0].message).toContain('OVERDUE');
    });

    it('should get notifications for urgent tasks', async () => {
      const mockTasks = [
        {
          id: 2,
          title: 'Urgent Task',
          description: 'This task is due soon',
          due_date: '2024-01-01 12:30:00',
          priority: 'High',
          status: 'In Progress',
          category: 'Personal',
          notification_type: 'urgent',
          minutes_until_due: 30
        }
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('urgent');
      expect(response.body.data[0].message).toContain('URGENT');
    });

    it('should get notifications for info tasks', async () => {
      const mockTasks = [
        {
          id: 3,
          title: 'Info Task',
          description: 'This task is due soon',
          due_date: '2024-01-01 13:00:00',
          priority: 'Medium',
          status: 'To Do',
          category: 'Work',
          notification_type: 'info',
          minutes_until_due: 60
        }
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('info');
      expect(response.body.data[0].message).toContain('due soon');
    });

    it('should handle database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch notifications');
    });

    it('should return empty array when no notifications', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should format overdue message correctly for minutes', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Overdue Task',
          description: 'This task is overdue',
          due_date: '2024-01-01 10:00:00',
          priority: 'High',
          status: 'To Do',
          category: 'Work',
          notification_type: 'overdue',
          minutes_until_due: -45
        }
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.data[0].message).toBe('OVERDUE: "Overdue Task" was due 45 minutes ago!');
    });

    it('should format overdue message correctly for hours and minutes', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Overdue Task',
          description: 'This task is overdue',
          due_date: '2024-01-01 10:00:00',
          priority: 'High',
          status: 'To Do',
          category: 'Work',
          notification_type: 'overdue',
          minutes_until_due: -90
        }
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.data[0].message).toBe('OVERDUE: "Overdue Task" was due 1h 30m ago!');
    });

    it('should format urgent message correctly', async () => {
      const mockTasks = [
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

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.data[0].message).toBe('URGENT: "Urgent Task" is due in 15 minutes!');
    });
  });
});