import api from './api';

const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

const getTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  console.log(response.data,"11")
  return response.data;
};

const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

const importTasks = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/tasks/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const exportTasks = async (format = 'excel') => {
  const response = await api.get(`/tasks/export?format=${format}`, {
    responseType: 'blob',
  });
  return response;
};

const taskService = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  importTasks,
  exportTasks,
};

export default taskService;