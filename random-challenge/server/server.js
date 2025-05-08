const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Імпорт маршрутів
const categoriesRoutes = require('./routes/categories');
const challengesRoutes = require('./routes/challenges');

// Конфігурація
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Логування для перевірки змінних середовища (для розробки)
console.log('Спроба підключення до MongoDB з URI:', 
  process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://user:****@'));

// Підключення до MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Atlas підключено успішно'))
  .catch(err => {
    console.error('Помилка підключення до MongoDB Atlas:', err);
    // Не завершуємо процес при помилці, дозволяємо серверу продовжувати роботу
    // Це дозволить перевіряти помилки через API
});

// Маршрути API
app.use('/api/categories', categoriesRoutes);
app.use('/api/challenges', challengesRoutes);

// Базовий маршрут
app.get('/', (req, res) => {
  res.send('API для додатку "Випадковий виклик" успішно працює');
});

// Перевірка статусу підключення до MongoDB
app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateText = {
    0: 'Відключено',
    1: 'Підключено',
    2: 'Підключення',
    3: 'Відключення'
  };
  
  res.json({
    server: 'Працює',
    database: dbStateText[dbState] || 'Невідомий стан',
    dbState: dbState
  });
});

// Обробка помилок
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ 
    message: 'Щось пішло не так на сервері!',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});