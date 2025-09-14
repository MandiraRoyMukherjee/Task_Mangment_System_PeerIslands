import API from "./api";


export const getTasks = () => API.get("/tasks");


export const createTask = (task) => API.post("/tasks", task);

export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);


export const deleteTask = (id) => API.delete(`/tasks/${id}`);
