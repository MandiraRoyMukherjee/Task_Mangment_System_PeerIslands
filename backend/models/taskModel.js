const db = require("../config/db");

const Task = {
  getAll: (userId, callback) => {
    const sql = "SELECT * FROM tasks WHERE user_id = ?";
    db.query(sql, [userId], callback);
  },
  getById: (id, callback) => {
    const sql = "SELECT * FROM tasks WHERE id = ?";
    db.query(sql, [id], callback);
  },
  create: (task, callback) => {
    const sql = `
      INSERT INTO tasks (title, description, status, priority, category, start_date, due_date, is_recurring, recurrence_pattern, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      task.title,
      task.description,
      task.status,
      task.priority,
      task.category || null,
      task.start_date,
      task.due_date,
      task.is_recurring ? 1 : 0,
      task.recurrence_pattern || null,
      task.user_id
    ], callback);
  },
  update: (id, task, callback) => {

    const fields = [];
    const values = [];
    
    if (task.title !== undefined) {
      fields.push('title = ?');
      values.push(task.title);
    }
    if (task.description !== undefined) {
      fields.push('description = ?');
      values.push(task.description);
    }
    if (task.status !== undefined) {
      fields.push('status = ?');
      values.push(task.status);
    }
    if (task.priority !== undefined) {
      fields.push('priority = ?');
      values.push(task.priority);
    }
    if (task.category !== undefined) {
      fields.push('category = ?');
      values.push(task.category);
    }
    if (task.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(task.start_date);
    }
    if (task.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(task.due_date);
    }
    if (task.is_recurring !== undefined) {
      fields.push('is_recurring = ?');
      values.push(task.is_recurring);
    }
    if (task.recurrence_pattern !== undefined) {
      fields.push('recurrence_pattern = ?');
      values.push(task.recurrence_pattern);
    }
    
    if (fields.length === 0) {
      return callback(new Error('No fields to update'));
    }
    
    values.push(id);
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    
    db.query(sql, values, callback);
  },
  delete: (id, callback) => {
    const sql = "DELETE FROM tasks WHERE id = ?";
    db.query(sql, [id], callback);
  }
};

module.exports = Task;
