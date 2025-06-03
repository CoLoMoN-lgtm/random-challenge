const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://randome-challange.netlify.app',
    'https://random-challenge.netlify.app'
  ],
  credentials: true
}));

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/random-challenge-app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB підключено'))
.catch(err => console.error('MongoDB помилка:', err));

// Схеми
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: 'bg-gray-500' }
});

const challengeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  categoryId: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  isActive: { type: Boolean, default: true }
});

const Category = mongoose.model('Category', categorySchema);
const Challenge = mongoose.model('Challenge', challengeSchema);

// Ініціалізація даних
async function initDB() {
  try {
    console.log('Перевірка бази даних...');
    
    const catCount = await Category.countDocuments();
    const chalCount = await Challenge.countDocuments();
    
    console.log(`Категорій: ${catCount}, Викликів: ${chalCount}`);
    
    if (catCount === 0) {
      console.log('Створюємо категорії...');
      
      const cats = await Category.insertMany([
        { name: 'Активні', color: 'bg-red-500' },
        { name: 'Творчі', color: 'bg-purple-500' },
        { name: 'Соціальні', color: 'bg-blue-500' },
        { name: 'Домашні', color: 'bg-green-500' },
        { name: 'Усвідомлені', color: 'bg-yellow-500' }
      ]);
      
      console.log('Категорії створено:', cats.length);
    }
    
    if (chalCount === 0) {
      console.log('Створюємо виклики...');
      
      // Отримуємо всі категорії
      const allCats = await Category.find();
      const active = allCats.find(c => c.name === 'Активні')?._id;
      const creative = allCats.find(c => c.name === 'Творчі')?._id;
      const social = allCats.find(c => c.name === 'Соціальні')?._id;
      const home = allCats.find(c => c.name === 'Домашні')?._id;
      const mindful = allCats.find(c => c.name === 'Усвідомлені')?._id;
      
      console.log('ID категорій:', { active, creative, social, home, mindful });
      
      if (active && creative && social && home && mindful) {
        await Challenge.insertMany([
          { text: 'Пройдіться на свіжому повітрі 15 хвилин', categoryId: active, difficulty: 'easy' },
          { text: 'Виконайте 10 присідань', categoryId: active, difficulty: 'medium' },
          { text: 'Зробіть зарядку 5 хвилин', categoryId: active, difficulty: 'easy' },
          
          { text: 'Намалюйте щось трьома кольорами', categoryId: creative, difficulty: 'medium' },
          { text: 'Напишіть короткий вірш', categoryId: creative, difficulty: 'medium' },
          { text: 'Зробіть цікаве фото', categoryId: creative, difficulty: 'easy' },
          
          { text: 'Напишіть другу', categoryId: social, difficulty: 'easy' },
          { text: 'Подзвоніть рідним', categoryId: social, difficulty: 'easy' },
          { text: 'Зробіть комплімент', categoryId: social, difficulty: 'medium' },
          
          { text: 'Приготуйте новий рецепт', categoryId: home, difficulty: 'medium' },
          { text: 'Прибрайте одну полицю', categoryId: home, difficulty: 'easy' },
          { text: 'Полийте рослини', categoryId: home, difficulty: 'easy' },
          
          { text: 'Медитуйте 5 хвилин', categoryId: mindful, difficulty: 'easy' },
          { text: 'Запишіть 3 речі за які вдячні', categoryId: mindful, difficulty: 'easy' },
          { text: 'Глибоко дихайте 2 хвилини', categoryId: mindful, difficulty: 'easy' }
        ]);
        
        console.log('Виклики створено!');
      } else {
        console.log('ПОМИЛКА: Не знайдено всі категорії для створення викликів');
      }
    }
    
    // Финальна перевірка
    const finalCatCount = await Category.countDocuments();
    const finalChalCount = await Challenge.countDocuments();
    console.log(`ФІНАЛЬНИЙ РЕЗУЛЬТАТ - Категорій: ${finalCatCount}, Викликів: ${finalChalCount}`);
    
  } catch (error) {
    console.error('ПОМИЛКА ініціалізації:', error);
  }
}

// API
app.get('/', (req, res) => {
  res.json({ message: 'Random Challenge API працює!' });
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

app.post('/api/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Виклики
app.get('/api/challenges', async (req, res) => {
  try {
    console.log('Challenges endpoint викликано з query:', req.query);
    
    let filter = { isActive: true };
    
    if (req.query.category && req.query.category !== 'all') {
      filter.categoryId = req.query.category;
    }
    
    console.log('Фільтр для challenges:', filter);
    
    const challenges = await Challenge.find(filter);
    console.log('Знайдено challenges:', challenges.length);
    
    res.json(challenges);
  } catch (error) {
    console.error('ПОМИЛКА в challenges endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/challenges/random', async (req, res) => {
  try {
    console.log('Random endpoint викликано з query:', req.query);
    
    let filter = { isActive: true };
    
    if (req.query.category && req.query.category !== 'all') {
      filter.categoryId = req.query.category;
      console.log('Фільтр за категорією:', filter);
    }
    
    console.log('Шукаємо з фільтром:', filter);
    
    const count = await Challenge.countDocuments(filter);
    console.log('Знайдено викликів:', count);
    
    if (count === 0) {
      console.log('Немає викликів для фільтра:', filter);
      return res.status(404).json({ error: 'Немає викликів' });
    }
    
    const random = Math.floor(Math.random() * count);
    console.log('Випадковий індекс:', random);
    
    const challenge = await Challenge.findOne(filter).skip(random);
    console.log('Знайдений виклик:', challenge);
    
    if (!challenge) {
      console.log('ПОМИЛКА: виклик не знайдено після skip');
      return res.status(404).json({ error: 'Виклик не знайдено' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('ПОМИЛКА в random endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/challenges', async (req, res) => {
  try {
    const challenge = new Challenge(req.body);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ТЕСТОВИЙ ENDPOINT ДЛЯ ІНІЦІАЛІЗАЦІЇ
app.post('/api/init', async (req, res) => {
  try {
    console.log('РУЧНА ІНІЦІАЛІЗАЦІЯ ВИКЛИКАНА');
    await initDB();
    
    const catCount = await Category.countDocuments();
    const chalCount = await Challenge.countDocuments();
    
    res.json({ 
      message: 'Ініціалізація завершена',
      categories: catCount,
      challenges: chalCount
    });
  } catch (error) {
    console.error('Помилка ручної ініціалізації:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEBUG ENDPOINT
app.get('/api/debug', async (req, res) => {
  try {
    const cats = await Category.find();
    const chals = await Challenge.find();
    
    res.json({
      categoriesCount: cats.length,
      categories: cats,
      challengesCount: chals.length,
      challenges: chals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск
app.listen(PORT, async () => {
  console.log(`Сервер на порту ${PORT}`);
  await initDB();
});
