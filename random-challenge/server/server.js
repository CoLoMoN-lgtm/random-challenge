const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS налаштування
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://randome-challange.netlify.app',
  'https://random-challenge.netlify.app',
  'https://netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Дозволяємо запити без origin (наприклад, мобільні додатки)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Для розробки - дозволяємо всі localhost та netlify домени
      if (origin.includes('localhost') || origin.includes('netlify.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// MongoDB підключення
const MONGODB_URI=mongodb+srv://lopskijdanilo:Lopskiy228@cluster0.0qotxua.mongodb.net/random-challenge-app?retryWrites=true&w=majority;

console.log('Спроба підключення до MongoDB з URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//user:****@'));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Atlas підключено успішно');
})
.catch(err => {
  console.error('Помилка підключення до MongoDB:', err);
});

// Схеми MongoDB
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    default: 'bg-gray-500'
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const challengeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  categoryId: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: 'system'
  }
});

// Моделі
const Category = mongoose.model('Category', categorySchema);
const Challenge = mongoose.model('Challenge', challengeSchema);

// Ініціалізація базових даних
async function initializeData() {
  try {
    // Перевіряємо чи є категорії
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      console.log('Ініціалізація базових категорій...');
      
      const defaultCategories = [
        { _id: 'active', name: 'Активні', color: 'bg-red-500', description: 'Фізична активність та спорт' },
        { _id: 'creative', name: 'Творчі', color: 'bg-purple-500', description: 'Творчість та мистецтво' },
        { _id: 'social', name: 'Соціальні', color: 'bg-blue-500', description: 'Спілкування та соціальна взаємодія' },
        { _id: 'home', name: 'Домашні', color: 'bg-green-500', description: 'Домашні справи та організація' },
        { _id: 'mindful', name: 'Усвідомлені', color: 'bg-yellow-500', description: 'Медитація та самопізнання' }
      ];
      
      await Category.insertMany(defaultCategories);
      console.log('Базові категорії створено');
    }
    
    // Перевіряємо чи є виклики
    const challengeCount = await Challenge.countDocuments();
    
    if (challengeCount === 0) {
      console.log('Ініціалізація базових викликів...');
      
      const defaultChallenges = [
        // Активні виклики
        { text: 'Пройдіться на свіжому повітрі протягом 15 хвилин', categoryId: 'active', difficulty: 'easy' },
        { text: 'Виконайте 10 присідань прямо зараз', categoryId: 'active', difficulty: 'medium' },
        { text: 'Зробіть 5-хвилинну зарядку', categoryId: 'active', difficulty: 'easy' },
        { text: 'Піднімайтеся сходами замість ліфта', categoryId: 'active', difficulty: 'easy' },
        { text: 'Виконайте 20 віджимань', categoryId: 'active', difficulty: 'hard' },
        { text: 'Пробіжіть 1 кілометр', categoryId: 'active', difficulty: 'medium' },
        
        // Творчі виклики
        { text: 'Намалюйте щось, використовуючи лише три кольори', categoryId: 'creative', difficulty: 'medium' },
        { text: 'Напишіть короткий вірш про свій день', categoryId: 'creative', difficulty: 'medium' },
        { text: 'Створіть оригамі з паперу', categoryId: 'creative', difficulty: 'hard' },
        { text: 'Сфотографуйте щось незвичайне', categoryId: 'creative', difficulty: 'easy' },
        { text: 'Придумайте та запишіть коротку історію', categoryId: 'creative', difficulty: 'medium' },
        
        // Соціальні виклики
        { text: 'Надішліть повідомлення старому другу', categoryId: 'social', difficulty: 'easy' },
        { text: 'Подзвоніть рідним', categoryId: 'social', difficulty: 'easy' },
        { text: 'Познайомтеся з новою людиною', categoryId: 'social', difficulty: 'hard' },
        { text: 'Зробіть комплімент незнайомцю', categoryId: 'social', difficulty: 'medium' },
        { text: 'Запросіть друга на каву', categoryId: 'social', difficulty: 'medium' },
        
        // Домашні виклики
        { text: 'Приготуйте новий рецепт', categoryId: 'home', difficulty: 'medium' },
        { text: 'Прибрайте один ящик або полицю', categoryId: 'home', difficulty: 'easy' },
        { text: 'Полийте всі рослини в домі', categoryId: 'home', difficulty: 'easy' },
        { text: 'Реорганізуйте свій робочий стіл', categoryId: 'home', difficulty: 'medium' },
        { text: 'Випрайте та повісьте білизну', categoryId: 'home', difficulty: 'easy' },
        
        // Усвідомлені виклики
        { text: 'Проведіть 5 хвилин у медитації', categoryId: 'mindful', difficulty: 'easy' },
        { text: 'Запишіть 3 речі, за які вдячні', categoryId: 'mindful', difficulty: 'easy' },
        { text: 'Послухайте улюблену пісню з закритими очима', categoryId: 'mindful', difficulty: 'easy' },
        { text: 'Практикуйте глибоке дихання 2 хвилини', categoryId: 'mindful', difficulty: 'easy' },
        { text: 'Проведіть 10 хвилин без телефону', categoryId: 'mindful', difficulty: 'medium' }
      ];
      
      await Challenge.insertMany(defaultChallenges);
      console.log('Базові виклики створено');
    }
    
  } catch (error) {
    console.error('Помилка ініціалізації даних:', error);
  }
}

// API Routes

// Головна сторінка
app.get('/', (req, res) => {
  res.json({ 
    message: 'Random Challenge API працює!',
    version: '1.0.0',
    endpoints: {
      categories: '/api/categories',
      challenges: '/api/challenges',
      random: '/api/challenges/random'
    }
  });
});

// Отримання всіх категорій
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Помилка отримання категорій:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні категорій' });
  }
});

// Додавання нової категорії
app.post('/api/categories', async (req, res) => {
  try {
    const { name, color, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Назва категорії обов\'язкова' });
    }
    
    const category = new Category({ name, color, description });
    const savedCategory = await category.save();
    
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Категорія з такою назвою вже існує' });
    } else {
      console.error('Помилка створення категорії:', error);
      res.status(500).json({ error: 'Помилка сервера при створенні категорії' });
    }
  }
});

// Отримання всіх викликів (з можливістю фільтрації за категорією)
app.get('/api/challenges', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.categoryId = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    console.error('Помилка отримання викликів:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні викликів' });
  }
});

// Отримання випадкового виклику
app.get('/api/challenges/random', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.categoryId = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    const count = await Challenge.countDocuments(filter);
    
    if (count === 0) {
      return res.status(404).json({ error: 'Не знайдено викликів за вказаними критеріями' });
    }
    
    const random = Math.floor(Math.random() * count);
    const challenge = await Challenge.findOne(filter).skip(random);
    
    res.json(challenge);
  } catch (error) {
    console.error('Помилка отримання випадкового виклику:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні випадкового виклику' });
  }
});

// Додавання нового виклику
app.post('/api/challenges', async (req, res) => {
  try {
    const { text, categoryId, difficulty } = req.body;
    
    if (!text || !categoryId) {
      return res.status(400).json({ error: 'Текст виклику та категорія обов\'язкові' });
    }
    
    // Перевіряємо чи існує категорія
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Вказана категорія не існує' });
    }
    
    const challenge = new Challenge({
      text,
      categoryId,
      difficulty: difficulty || 'medium',
      createdBy: 'user'
    });
    
    const savedChallenge = await challenge.save();
    res.status(201).json(savedChallenge);
  } catch (error) {
    console.error('Помилка створення виклику:', error);
    res.status(500).json({ error: 'Помилка сервера при створенні виклику' });
  }
});

// Оновлення виклику
app.put('/api/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const challenge = await Challenge.findByIdAndUpdate(id, updates, { new: true });
    
    if (!challenge) {
      return res.status(404).json({ error: 'Виклик не знайдено' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Помилка оновлення виклику:', error);
    res.status(500).json({ error: 'Помилка сервера при оновленні виклику' });
  }
});

// Видалення виклику (м'яке видалення)
app.delete('/api/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const challenge = await Challenge.findByIdAndUpdate(id, { isActive: false }, { new: true });
    
    if (!challenge) {
      return res.status(404).json({ error: 'Виклик не знайдено' });
    }
    
    res.json({ message: 'Виклик видалено', challenge });
  } catch (error) {
    console.error('Помилка видалення виклику:', error);
    res.status(500).json({ error: 'Помилка сервера при видаленні виклику' });
  }
});

// Статистика
app.get('/api/stats', async (req, res) => {
  try {
    const totalChallenges = await Challenge.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments();
    
    const challengesByCategory = await Challenge.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { categoryName: '$category.name', count: 1 } }
    ]);
    
    const challengesByDifficulty = await Challenge.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalChallenges,
      totalCategories,
      challengesByCategory,
      challengesByDifficulty
    });
  } catch (error) {
    console.error('Помилка отримання статистики:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні статистики' });
  }
});

// Обробка помилок 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint не знайдено',
    availableEndpoints: [
      'GET /',
      'GET /api/categories',
      'POST /api/categories',
      'GET /api/challenges',
      'GET /api/challenges/random',
      'POST /api/challenges',
      'PUT /api/challenges/:id',
      'DELETE /api/challenges/:id',
      'GET /api/stats'
    ]
  });
});

// Глобальна обробка помилок
app.use((err, req, res, next) => {
  console.error('Глобальна помилка:', err);
  res.status(500).json({ error: 'Внутрішня помилка сервера' });
});

// Запуск сервера
app.listen(PORT, async () => {
  console.log(`Сервер запущено на порту ${PORT}`);
  
  // Ініціалізація даних після запуску сервера
  await initializeData();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Отримано SIGINT. Закриваємо сервер...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Отримано SIGTERM. Закриваємо сервер...');
  await mongoose.connection.close();
  process.exit(0);
});
