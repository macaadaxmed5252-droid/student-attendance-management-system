import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject Bearer Token into outbound network frames
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept error packets to drop corrupted state keys
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
};

export const studentAPI = {
  getAll: () => API.get('/students'),
  getById: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
};

export const teacherAPI = {
  getAll: () => API.get('/teachers'),
  getById: (id) => API.get(`/teachers/${id}`),
  create: (data) => API.post('/teachers', data),
  update: (id, data) => API.put(`/teachers/${id}`, data),
  delete: (id) => API.delete(`/teachers/${id}`),
};

export const attendanceAPI = {
  getAll: () => API.get('/attendance'),
  getByStudent: (studentId) => API.get(`/attendance/student/${studentId}`),
  mark: (data) => API.post('/attendance', data),
  update: (id, data) => API.put(`/attendance/${id}`, data),
  delete: (id) => API.delete(`/attendance/${id}`),
};

export default API;