import API from '../api/api';

class ApiService {
  async request(method, url, data = null) {
    try {
      const config = {
        method,
        url,
        ...(data && { data })
      };

      const response = await API(config);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`API Error [${method} ${url}]:`, error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'An error occurred',
        status: error.response?.status || 500
      };
    }
  }


  async getTasks() {
    return this.request('GET', '/tasks');
  }

  async createTask(taskData) {
    return this.request('POST', '/tasks', taskData);
  }

  async updateTask(taskId, taskData) {
    return this.request('PUT', `/tasks/${taskId}`, taskData);
  }

  async deleteTask(taskId) {
    return this.request('DELETE', `/tasks/${taskId}`);
  }


  async login(credentials) {
    return this.request('POST', '/auth/login', credentials);
  }

  async register(userData) {
    return this.request('POST', '/auth/register', userData);
  }
}

export const apiService = new ApiService();


export const taskAPI = {
  getTasks: () => apiService.getTasks(),
  createTask: (data) => apiService.createTask(data),
  updateTask: (id, data) => apiService.updateTask(id, data),
  deleteTask: (id) => apiService.deleteTask(id)
};

export const authAPI = {
  login: (credentials) => apiService.login(credentials),
  register: (userData) => apiService.register(userData)
};
