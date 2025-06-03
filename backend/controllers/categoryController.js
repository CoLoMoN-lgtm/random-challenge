const { Category, Challenge } = require('../models');
const { validationResult } = require('express-validator');

// Отримати всі категорії
exports.getAllCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const query = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(query)
      .populate('challengeCount')
      .sort('name');
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Отримати категорію за ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('challengeCount');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Категорія не знайдена'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Створити нову категорію
exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { name, emoji, color, description } = req.body;
    
    // Перевіряємо чи не існує вже така категорія
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Категорія з такою назвою вже існує'
      });
    }
    
    const category = await Category.create({
      name,
      emoji,
      color,
      description
    });
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Оновити категорію
exports.updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Категорія не знайдена'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Видалити категорію (soft delete)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Категорія не знайдена'
      });
    }
    
    // Перевіряємо чи немає активних викликів в цій категорії
    const challengeCount = await Challenge.countDocuments({
      categoryId: req.params.id,
      isActive: true
    });
    
    if (challengeCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Неможливо видалити категорію з ${challengeCount} активними викликами`
      });
    }
    
    // Soft delete
    category.isActive = false;
    await category.save();
    
    res.json({
      success: true,
      message: 'Категорія успішно видалена'
    });
  } catch (error) {
    next(error);
  }
};