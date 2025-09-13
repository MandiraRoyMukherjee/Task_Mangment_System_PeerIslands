const Task = require("../models/taskModel");

exports.getAllTasks = (req, res) => {
  const userId = req.user.id;
  Task.getAll(userId, (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch tasks" });
    }
    res.json(results);
  });
};

exports.getTaskById = (req, res) => {
  Task.getById(req.params.id, (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "Task not found" });
    res.json(results[0]);
  });
};

exports.createTask = (req, res) => {
  const newTask = { ...req.body, user_id: req.user.id };
  console.log("Creating task:", newTask);
  Task.create(newTask, (err, result) => {
    if (err) {
      console.error("Error creating task:", err);
      return res.status(500).json({ error: err.message || "Failed to create task" });
    }
    res.status(201).json({ message: "Task created successfully", taskId: result.insertId });
  });
};

exports.updateTask = (req, res) => {
  console.log("Updating task:", req.params.id, req.body);
  Task.update(req.params.id, req.body, (err, result) => {
    if (err) {
      console.error("Error updating task:", err);
      return res.status(500).json({ error: err.message || "Failed to update task" });
    }
    res.json({ message: "Task updated successfully" });
  });
};

exports.deleteTask = (req, res) => {
  Task.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Task deleted" });
  });
};
