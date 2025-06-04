const { body } = require('express-validator');

const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Ім\'я користувача обов\'язкове')
    .isLength({ min: 3, max: 30 })
    .withMessage('Ім\'я користувача має бути від 3 до 30 символів')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('Ім\'я користувача може містити тільки малі літери, цифри, дефіс та підкреслення'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email обов\'язковий')
    .isEmail().withMessage('Невірний формат email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Пароль обов\'язковий')
    .isLength({ min: 6 })
    .withMessage('Пароль має містити мінімум 6 символів')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Пароль має містити малі та великі літери, а також цифри'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ім\'я не може бути довшим за 100 символів')
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email обов\'язковий')
    .isEmail().withMessage('Невірний формат email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Пароль обов\'язковий')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty().withMessage('Поточний пароль обов\'язковий'),
  
  body('newPassword')
    .notEmpty().withMessage('Новий пароль обов\'язковий')
    .isLength({ min: 6 })
    .withMessage('Новий пароль має містити мінімум 6 символів')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Пароль має містити малі та великі літери, а також цифри')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('Новий пароль не може бути таким самим як поточний')
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ім\'я не може бути довшим за 100 символів'),
  
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar має бути валідним URL'),
  
  body('preferences.favoriteCategories')
    .optional()
    .isArray()
    .withMessage('Улюблені категорії мають бути масивом'),
  
  body('preferences.difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'mixed'])
    .withMessage('Невірна складність'),
  
  body('preferences.dailyGoal')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Денна ціль має бути від 1 до 10')
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate
};