const { Challenge, Category } = require('../models');
const { validationResult } = require('express-validator');

// Отримати всі виклики
exports.getAllChallenges = async (req, res, next) => {
  try {
    const {
      category,
      difficulty,
      tags,
      includeInactive,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;
    
    // Створюємо фільтр
    const filter = {};
    if (!includeInactive || includeInactive !== 'true') {
      filter.isActive = true;
    }
    if (category) filter.categoryId = category;
    if (difficulty) filter.difficulty = difficulty;
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      filter.tags = { $in: tagsArray };
    }
    
    // Пагінація
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const challenges = await Challenge.find(filter)
      .populate('categoryId')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Challenge.countDocuments(filter);
    
    res.json({
      success: true,
      count: challenges.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: challenges
    });
  } catch (error) {
    next(error);
  }
};

// Отримати виклик за ID
exports.getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('categoryId');
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Виклик не знайдено'
      });
    }
    
    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// Отримати випадковий виклик
exports.getRandomChallenge = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};
    
    if (category) filter.categoryId = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const challenge = await Challenge.getRandomChallenge(filter);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Немає доступних викликів з вказаними параметрами'
      });
    }
    
    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// Створити новий виклик
exports.createChallenge = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      text,
      categoryId,
      difficulty,
      timeEstimate,
      tags
    } = req.body;
    
    // Перевіряємо чи існує категорія
    const categoryExists = await Category.exists({ _id: categoryId, isActive: true });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Вказана категорія не існує або неактивна'
      });
    }
    
    const challenge = await Challenge.create({
      text,
      categoryId,
      difficulty,
      timeEstimate,
      tags,
      createdBy: req.user ? req.user._id : null
    });
    
    await challenge.populate('categoryId');
    
    res.status(201).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// Оновити виклик
exports.updateChallenge = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Якщо оновлюємо категорію, перевіряємо чи вона існує
    if (req.body.categoryId) {
      const categoryExists = await Category.exists({
        _id: req.body.categoryId,
        isActive: true
      });
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Вказана категорія не існує або неактивна'
        });
      }
    }
    
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('categoryId');
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Виклик не знайдено'
      });
    }
    
    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// Видалити виклик (soft delete)
exports.deleteChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Виклик не знайдено'
      });
    }
    
    // Soft delete
    challenge.isActive = false;
    await challenge.save();
    
    res.json({
      success: true,
      message: 'Виклик успішно видалено'
    });
  } catch (error) {
    next(error);
  }
};

// Оцінити виклик
exports.rateChallenge = async (req, res, next) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Рейтинг має бути від 1 до 5'
      });
    }
    
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Виклик не знайдено'
      });
    }
    
    await challenge.addRating(rating);
    
    res.json({
      success: true,
      data: {
        averageRating: challenge.averageRating,
        ratingCount: challenge.ratingCount
      }
    });
  } catch (error) {
    next(error);
  }
};