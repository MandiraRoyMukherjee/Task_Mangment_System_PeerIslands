import API from "./api";

// ✅ Get all tasks for the logged-in user
export const getTasks = () => API.get("/tasks");

// ✅ Create a new task
export const createTask = (task) => API.post("/tasks", task);

// ✅ Update a task
export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);

// ✅ Delete a task
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
