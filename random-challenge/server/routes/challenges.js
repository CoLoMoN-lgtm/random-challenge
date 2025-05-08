const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Category = require('../models/Category');

// Отримати всі виклики
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let query = {};
    
    // Фільтрація за категорією
    if (category && category !== 'all') {
      query.categoryId = category;
    }
    
    // Фільтрація за складністю
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    const challenges = await Challenge.find(query).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Отримати випадковий виклик
router.get('/random', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let query = {};
    
    // Фільтрація за категорією
    if (category && category !== 'all') {
      query.categoryId = category;
    }
    
    // Фільтрація за складністю
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Підрахунок кількості документів, що відповідають запиту
    const count = await Challenge.countDocuments(query);
    
    if (count === 0) {
      return res.status(404).json({ message: 'Викликів, що відповідають запиту, не знайдено' });
    }
    
    // Генерація випадкового індексу
    const random = Math.floor(Math.random() * count);
    
    // Отримання випадкового документа
    const challenge = await Challenge.findOne(query).skip(random);
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Отримати виклик за ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Виклик не знайдено' });
    }
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Створити новий виклик
router.post('/', async (req, res) => {
  try {
    const { text, categoryId, difficulty } = req.body;
    
    // Перевірка необхідних полів
    if (!text || !categoryId) {
      return res.status(400).json({ message: 'Необхідні поля: text, categoryId' });
    }
    
    // Перевірка наявності категорії
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Категорію не знайдено' });
    }
    
    const newChallenge = new Challenge({
      text,
      categoryId,
      difficulty: difficulty || 'medium'
    });
    
    const savedChallenge = await newChallenge.save();
    res.status(201).json(savedChallenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Оновити виклик
router.put('/:id', async (req, res) => {
  try {
    const { text, categoryId, difficulty } = req.body;
    
    // Якщо надано categoryId, перевіряємо її існування
    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Категорію не знайдено' });
      }
    }
    
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { text, categoryId, difficulty },
      { new: true, runValidators: true }
    );
    
    if (!updatedChallenge) {
      return res.status(404).json({ message: 'Виклик не знайдено' });
    }
    
    res.json(updatedChallenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Видалити виклик
router.delete('/:id', async (req, res) => {
  try {
    const deletedChallenge = await Challenge.findByIdAndDelete(req.params.id);
    
    if (!deletedChallenge) {
      return res.status(404).json({ message: 'Виклик не знайдено' });
    }
    
    res.json({ message: 'Виклик видалено', challenge: deletedChallenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Інкрементувати лічильник завершень виклику
router.post('/:id/complete', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Виклик не знайдено' });
    }
    
    challenge.completionCount += 1;
    const updatedChallenge = await challenge.save();
    
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Встановити рейтинг для виклику
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    
    // Перевірка валідності рейтингу
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Рейтинг повинен бути числом від 0 до 5' });
    }
    
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Виклик не знайдено' });
    }
    
    challenge.rating = rating;
    const updatedChallenge = await challenge.save();
    
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;