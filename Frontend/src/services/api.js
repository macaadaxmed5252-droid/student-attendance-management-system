import axios from 'axios';
import Swal from 'sweetalert2';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Your security token has expired or is invalid. Please log in again to continue.',
        confirmButtonColor: '#4f46e5',
      }).then(() => {
        window.location.href = '/login';
      });
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
  create: (data, config) => API.post('/students', data, config),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
};

export const teacherAPI = {
  getAll: () => API.get('/teachers'),
  getMe: () => API.get('/teachers/me'),
  getById: (id) => API.get(`/teachers/${id}`),
  create: (data, config) => API.post('/teachers', data, config),
  update: (id, data) => API.put(`/teachers/${id}`, data),
  delete: (id) => API.delete(`/teachers/${id}`),
};

export const attendanceAPI = {
  getAll: () => API.get('/attendance'),
  getByStudent: (studentId) => API.get(`/attendance/student/${studentId}`),
  getMyMetrics: () => API.get('/attendance/my-metrics'),
  mark: (data) => API.post('/attendance', data),
  update: (id, data) => API.put(`/attendance/${id}`, data),
  delete: (id) => API.delete(`/attendance/${id}`),
};

export const classAPI = {
  getAll: () => API.get('/classes'),
  create: (data, config) => API.post('/classes', data, config),
  update: (id, data) => API.put(`/classes/${id}`, data),
  delete: (id) => API.delete(`/classes/${id}`),
};

export default API;
