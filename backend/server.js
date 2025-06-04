const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// MongoDB підключення
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/random-challenge';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB підключено'))
  .catch(err => console.error('MongoDB помилка:', err));

// Схеми
const categorySchema = new mongoose.Schema({
  name: String,
  emoji: String,
  color: String
});

const challengeSchema = new mongoose.Schema({
  text: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);
const Challenge = mongoose.model('Challenge', challengeSchema);

// Ініціалізація даних
async function seedData() {
  try {
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      console.log('Створюємо початкові дані...');
      
      // Створюємо категорії
      const categories = await Category.insertMany([
        { name: 'Активні', emoji: '🏃', color: '#ff6b6b' },
        { name: 'Творчі', emoji: '🎨', color: '#9c88ff' },
        { name: 'Соціальні', emoji: '👥', color: '#4ecdc4' },
        { name: 'Домашні', emoji: '🏠', color: '#45b7d1' },
        { name: 'Усвідомлені', emoji: '🧘', color: '#96ceb4' }
      ]);
      
      console.log('Категорії створено:', categories.length);
      
      // Створюємо виклики
      const challengesData = [
        // Активні
        { text: 'Пройдіться на свіжому повітрі 15 хвилин', categoryId: categories[0]._id, difficulty: 'easy' },
        { text: 'Зробіть 10 присідань', categoryId: categories[0]._id, difficulty: 'medium' },
        { text: 'Потанцюйте під улюблену пісню', categoryId: categories[0]._id, difficulty: 'easy' },
        { text: 'Зробіть планку 30 секунд', categoryId: categories[0]._id, difficulty: 'hard' },
        
        // Творчі
        { text: 'Намалюйте щось 3 кольорами', categoryId: categories[1]._id, difficulty: 'medium' },
        { text: 'Напишіть короткий вірш', categoryId: categories[1]._id, difficulty: 'medium' },
        { text: 'Зробіть фото чогось незвичайного', categoryId: categories[1]._id, difficulty: 'easy' },
        { text: 'Створіть оригамі', categoryId: categories[1]._id, difficulty: 'hard' },
        
        // Соціальні
        { text: 'Напишіть старому другу', categoryId: categories[2]._id, difficulty: 'easy' },
        { text: 'Подзвоніть рідним', categoryId: categories[2]._id, difficulty: 'easy' },
        { text: 'Зробіть комплімент', categoryId: categories[2]._id, difficulty: 'medium' },
        { text: 'Познайомтеся з новою людиною', categoryId: categories[2]._id, difficulty: 'hard' },
        
        // Домашні
        { text: 'Приберіть одну полицю', categoryId: categories[3]._id, difficulty: 'easy' },
        { text: 'Приготуйте новий рецепт', categoryId: categories[3]._id, difficulty: 'medium' },
        { text: 'Полийте рослини', categoryId: categories[3]._id, difficulty: 'easy' },
        { text: 'Реорганізуйте шафу', categoryId: categories[3]._id, difficulty: 'hard' },
        
        // Усвідомлені
        { text: 'Медитуйте 5 хвилин', categoryId: categories[4]._id, difficulty: 'easy' },
        { text: 'Запишіть 3 речі за які вдячні', categoryId: categories[4]._id, difficulty: 'easy' },
        { text: 'Глибоко дихайте 2 хвилини', categoryId: categories[4]._id, difficulty: 'medium' },
        { text: '10 хвилин без телефону', categoryId: categories[4]._id, difficulty: 'hard' }
      ];
      
      await Challenge.insertMany(challengesData);
      console.log('Виклики створено:', challengesData.length);
    }
  } catch (error) {
    console.error('Помилка ініціалізації:', error);
  }
}

// API Routes

// Головна
app.get('/', (req, res) => {
  res.json({ 
    message: 'Random Challenge API v1.0',
    endpoints: [
      'GET /api/categories',
      'GET /api/challenges',
      'GET /api/challenges/random',
      'POST /api/challenges'
    ]
  });
});

// Категорії
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Всі виклики
app.get('/api/challenges', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    
    if (category && category !== 'all') {
      filter.categoryId = category;
    }
    
    const challenges = await Challenge.find(filter).populate('categoryId');
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Випадковий виклик
app.get('/api/challenges/random', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    
    if (category && category !== 'all') {
      filter.categoryId = category;
    }
    
    const count = await Challenge.countDocuments(filter);
    
    if (count === 0) {
      return res.status(404).json({ error: 'Немає викликів' });
    }
    
    const random = Math.floor(Math.random() * count);
    const challenge = await Challenge.findOne(filter).skip(random).populate('categoryId');
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Додати виклик
app.post('/api/challenges', async (req, res) => {
  try {
    const { text, categoryId, difficulty } = req.body;
    
    if (!text || !categoryId) {
      return res.status(400).json({ error: 'Text та categoryId обов\'язкові' });
    }
    
    const challenge = new Challenge({
      text,
      categoryId,
      difficulty: difficulty || 'medium'
    });
    
    await challenge.save();
    await challenge.populate('categoryId');
    
    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Статистика
app.get('/api/stats', async (req, res) => {
  try {
    const totalChallenges = await Challenge.countDocuments();
    const totalCategories = await Category.countDocuments();
    
    const byCategory = await Challenge.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { categoryName: '$category.name', count: 1 } }
    ]);
    
    res.json({
      totalChallenges,
      totalCategories,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Сервер запущено на порту ${PORT}`);
  await seedData();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});