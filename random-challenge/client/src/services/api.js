// src/services/api.js
import axios from 'axios';

// Базовий URL для API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Створення інстансу axios з базовим URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API сервіс для виконання запитів до бекенду
const apiService = {
  // Отримання всіх категорій
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Отримання всіх викликів (можливо з фільтрацією за категорією)
  getChallenges: async (categoryId = null) => {
    try {
      const params = categoryId && categoryId !== 'all' ? { category: categoryId } : {};
      const response = await api.get('/challenges', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Отримання випадкового виклику
  getRandomChallenge: async (categoryId = null) => {
    try {
      const params = categoryId && categoryId !== 'all' ? { category: categoryId } : {};
      const response = await api.get('/challenges/random', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching random challenge:', error);
      throw error;
    }
  },

  // Додавання нового виклику
  addChallenge: async (challenge) => {
    try {
      const response = await api.post('/challenges', challenge);
      return response.data;
    } catch (error) {
      console.error('Error adding challenge:', error);
      throw error;
    }
  },

  // Додавання нової категорії
  addCategory: async (category) => {
    try {
      const response = await api.post('/categories', category);
      return response.data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }
};

export default apiService;