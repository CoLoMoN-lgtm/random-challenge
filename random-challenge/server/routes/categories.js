const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Отримати всі категорії
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Отримати категорію за ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Створити нову категорію
router.post('/', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    // Перевірка необхідних полів
    if (!name || !color) {
      return res.status(400).json({ message: 'Необхідні поля: name, color' });
    }
    
    // Перевірка унікальності назви
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Категорія з такою назвою вже існує' });
    }
    
    // Отримання максимального порядкового номера для сортування
    const maxOrderCategory = await Category.findOne().sort('-order');
    const order = maxOrderCategory ? maxOrderCategory.order + 1 : 0;
    
    const newCategory = new Category({
      name,
      color,
      icon: icon || 'sparkles',
      order
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Оновити категорію
router.put('/:id', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    // Перевірка унікальності назви, якщо вона змінюється
    if (name) {
      const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Категорія з такою назвою вже існує' });
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, color, icon },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Видалити категорію
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }
    
    res.json({ message: 'Категорію видалено', category: deletedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;