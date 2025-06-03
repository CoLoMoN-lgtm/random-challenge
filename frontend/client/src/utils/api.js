import axios from 'axios';

// Створюємо екземпляр axios з базовими налаштуваннями
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для обробки помилок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Сервер відповів з помилкою
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Запит був відправлений, але відповіді не отримано
      console.error('Network Error:', error.request);
    } else {
      // Щось пішло не так при налаштуванні запиту
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const challengeAPI = {
  // Отримати випадковий челендж
  getRandom: () => api.get('/api/challenge/random'),
  
  // Отримати челендж за категорією
  getByCategory: (category) => api.get(`/api/challenge/random/${category}`),
  
  // Додати новий челендж
  create: (challengeData) => api.post('/api/challenge', challengeData),
  
  // Отримати всі челенджі
  getAll: () => api.get('/api/challenges'),
};

export const categoryAPI = {
  // Отримати всі категорії
  getAll: () => api.get('/api/categories'),
};

export const healthAPI = {
  // Перевірити статус сервера
  check: () => api.get('/api/health'),
};

export default api;