const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const validateChallenge = [
  body('text')
    .trim()
    .notEmpty().withMessage('Текст виклику обов\'язковий')
    .isLength({ min: 10, max: 500 })
    .withMessage('Текст має бути від 10 до 500 символів'),
  
  body('categoryId')
    .notEmpty().withMessage('Категорія обов\'язкова')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Невірний формат ID категорії'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Складність має бути: easy, medium або hard'),
  
  body('timeEstimate')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Час виконання має бути від 1 до 180 хвилин'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги мають бути масивом'),
  
  body('tags.*')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Кожен тег має бути від 2 до 20 символів')
];

const validateChallengeUpdate = [
  body('text')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Текст має бути від 10 до 500 символів'),
  
  body('categoryId')
    .optional()
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Невірний формат ID категорії'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Складність має бути: easy, medium або hard'),
  
  body('timeEstimate')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Час виконання має бути від 1 до 180 хвилин'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги мають бути масивом'),
  
  body('tags.*')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Кожен тег має бути від 2 до 20 символів')
];

const validateRating = [
  body('rating')
    .notEmpty().withMessage('Рейтинг обов\'язковий')
    .isInt({ min: 1, max: 5 })
    .withMessage('Рейтинг має бути від 1 до 5')
];

module.exports = {
  validateChallenge,
  validateChallengeUpdate,
  validateRating
};