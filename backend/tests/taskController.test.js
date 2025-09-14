const request = require('supertest');
const express = require('express');

jest.mock('../models/taskModel');

const Task = require('../models/taskModel');
const taskController = require('../controllers/taskController');

const app = express();
app.use(express.json());

const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1 };
  next();
};

app.get('/tasks', mockAuthMiddleware, taskController.getAllTasks);
app.get('/tasks/:id', taskController.getTaskById);
app.post('/tasks', mockAuthMiddleware, taskController.createTask);
app.put('/tasks/:id', taskController.updateTask);
app.delete('/tasks/:id', taskController.deleteTask);

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Description 1',
          status: 'To Do',
          priority: 'High',
          user_id: 1
        },
        {
          id: 2,
          title: 'Test Task 2',
          description: 'Description 2',
          status: 'In Progress',
          priority: 'Medium',
          user_id: 1
        }
      ];

      Task.getAll.mockImplementation((userId, callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(Task.getAll).toHaveBeenCalledWith(1, expect.any(Function));
    });

    it('should handle error when fetching tasks', async () => {
      Task.getAll.mockImplementation((userId, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/tasks');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /tasks/:id', () => {
    it('should get task by id', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'To Do',
        priority: 'High'
      };

      Task.getById.mockImplementation((id, callback) => {
        callback(null, [mockTask]);
      });

      const response = await request(app)
        .get('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTask);
      expect(Task.getById).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should return 404 when task not found', async () => {
      Task.getById.mockImplementation((id, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });

    it('should handle error when fetching task by id', async () => {
      Task.getById.mockImplementation((id, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/tasks/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'To Do',
        priority: 'High',
        category: 'Work'
      };

      Task.create.mockImplementation((task, callback) => {
        callback(null, { insertId: 1 });
      });

      const response = await request(app)
        .post('/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.taskId).toBe(1);
      expect(Task.create).toHaveBeenCalledWith(
        { ...taskData, user_id: 1 },
        expect.any(Function)
      );
    });

    it('should handle error when creating task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'To Do',
        priority: 'High'
      };

      Task.create.mockImplementation((task, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/tasks')
        .send(taskData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'In Progress'
      };

      Task.update.mockImplementation((id, task, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task updated successfully');
      expect(Task.update).toHaveBeenCalledWith('1', updateData, expect.any(Function));
    });

    it('should handle error when updating task', async () => {
      const updateData = {
        title: 'Updated Task'
      };

      Task.update.mockImplementation((id, task, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      Task.delete.mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted');
      expect(Task.delete).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should handle error when deleting task', async () => {
      Task.delete.mockImplementation((id, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .delete('/tasks/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });
});