const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// In-memory data storage
let categories = [];
let challenges = [];
let nextCategoryId = 1;
let nextChallengeId = 1;

// Helper function to generate IDs
function generateId(type) {
  if (type === 'category') {
    return `cat_${nextCategoryId++}`;
  }
  return `chl_${nextChallengeId++}`;
}

// Initialize data
function seedData() {
  console.log('Створюємо початкові дані...');
  
  // Create categories
  categories = [
    { _id: generateId('category'), name: 'Активні', emoji: '🏃', color: '#ff6b6b' },
    { _id: generateId('category'), name: 'Творчі', emoji: '🎨', color: '#9c88ff' },
    { _id: generateId('category'), name: 'Соціальні', emoji: '👥', color: '#4ecdc4' },
    { _id: generateId('category'), name: 'Домашні', emoji: '🏠', color: '#45b7d1' },
    { _id: generateId('category'), name: 'Усвідомлені', emoji: '🧘', color: '#96ceb4' }
  ];
  
  console.log('Категорії створено:', categories.length);
  
  // Create challenges
  challenges = [
    // Активні
    { _id: generateId('challenge'), text: 'Пройдіться на свіжому повітрі 15 хвилин', categoryId: categories[0]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Зробіть 10 присідань', categoryId: categories[0]._id, difficulty: 'medium', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Потанцюйте під улюблену пісню', categoryId: categories[0]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Зробіть планку 30 секунд', categoryId: categories[0]._id, difficulty: 'hard', createdAt: new Date() },
    
    // Творчі
    { _id: generateId('challenge'), text: 'Намалюйте щось 3 кольорами', categoryId: categories[1]._id, difficulty: 'medium', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Напишіть короткий вірш', categoryId: categories[1]._id, difficulty: 'medium', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Зробіть фото чогось незвичайного', categoryId: categories[1]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Створіть оригамі', categoryId: categories[1]._id, difficulty: 'hard', createdAt: new Date() },
    
    // Соціальні
    { _id: generateId('challenge'), text: 'Напишіть старому другу', categoryId: categories[2]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Подзвоніть рідним', categoryId: categories[2]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Зробіть комплімент', categoryId: categories[2]._id, difficulty: 'medium', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Познайомтеся з новою людиною', categoryId: categories[2]._id, difficulty: 'hard', createdAt: new Date() },
    
    // Домашні
    { _id: generateId('challenge'), text: 'Приберіть одну полицю', categoryId: categories[3]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Приготуйте новий рецепт', categoryId: categories[3]._id, difficulty: 'medium', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Полийте рослини', categoryId: categories[3]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Реорганізуйте шафу', categoryId: categories[3]._id, difficulty: 'hard', createdAt: new Date() },
    
    // Усвідомлені
    { _id: generateId('challenge'), text: 'Медитуйте 5 хвилин', categoryId: categories[4]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Запишіть 3 речі за які вдячні', categoryId: categories[4]._id, difficulty: 'easy', createdAt: new Date() },
    { _id: generateId('challenge'), text: 'Глибоко дихайте 2 хвилини', categoryId: categories[4]._id, difficulty: 'medium', createdAt: new Date() },
    { _id: generateId('challenge'), text: '10 хвилин без телефону', categoryId: categories[4]._id, difficulty: 'hard', createdAt: new Date() }
  ];
  
  console.log('Виклики створено:', challenges.length);
}

// Helper function to populate category data in challenges
function populateChallenge(challenge) {
  const category = categories.find(cat => cat._id === challenge.categoryId);
  return {
    ...challenge,
    categoryId: category || challenge.categoryId
  };
}

// API Routes

// Home
app.get('/', (req, res) => {
  res.json({ 
    message: 'Random Challenge API v1.0 (In-Memory)',
    endpoints: [
      'GET /api/categories',
      'GET /api/challenges',
      'GET /api/challenges/random',
      'POST /api/challenges'
    ]
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Get all challenges
app.get('/api/challenges', (req, res) => {
  const { category } = req.query;
  
  let filteredChallenges = challenges;
  
  if (category && category !== 'all') {
    filteredChallenges = challenges.filter(ch => ch.categoryId === category);
  }
  
  // Populate category data
  const populatedChallenges = filteredChallenges.map(populateChallenge);
  
  res.json(populatedChallenges);
});

// Get random challenge
app.get('/api/challenges/random', (req, res) => {
  const { category } = req.query;
  
  let filteredChallenges = challenges;
  
  if (category && category !== 'all') {
    filteredChallenges = challenges.filter(ch => ch.categoryId === category);
  }
  
  if (filteredChallenges.length === 0) {
    return res.status(404).json({ error: 'Немає викликів' });
  }
  
  const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
  const randomChallenge = populateChallenge(filteredChallenges[randomIndex]);
  
  res.json(randomChallenge);
});

// Add new challenge
app.post('/api/challenges', (req, res) => {
  const { text, categoryId, difficulty } = req.body;
  
  if (!text || !categoryId) {
    return res.status(400).json({ error: 'Text та categoryId обов\'язкові' });
  }
  
  // Check if category exists
  const categoryExists = categories.some(cat => cat._id === categoryId);
  if (!categoryExists) {
    return res.status(400).json({ error: 'Категорія не знайдена' });
  }
  
  const newChallenge = {
    _id: generateId('challenge'),
    text,
    categoryId,
    difficulty: difficulty || 'medium',
    createdAt: new Date()
  };
  
  challenges.push(newChallenge);
  
  // Return populated challenge
  const populatedChallenge = populateChallenge(newChallenge);
  res.status(201).json(populatedChallenge);
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const totalChallenges = challenges.length;
  const totalCategories = categories.length;
  
  // Count challenges by category
  const byCategory = categories.map(category => {
    const count = challenges.filter(ch => ch.categoryId === category._id).length;
    return {
      _id: category._id,
      categoryName: category.name,
      count: count
    };
  });
  
  res.json({
    totalChallenges,
    totalCategories,
    byCategory
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
  console.log('Використовуємо in-memory дані (без MongoDB)');
  seedData();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nСервер зупинено');
  process.exit(0);
});