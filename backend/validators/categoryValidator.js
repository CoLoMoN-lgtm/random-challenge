const { body } = require('express-validator');

const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Назва категорії обов\'язкова')
    .isLength({ max: 50 }).withMessage('Назва не може бути довшою за 50 символів'),
  
  body('emoji')
    .trim()
    .notEmpty().withMessage('Emoji обов\'язковий')
    .isLength({ max: 5 }).withMessage('Emoji не може бути довшим за 5 символів'),
  
  body('color')
    .trim()
    .notEmpty().withMessage('Колір обов\'язковий')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Невірний формат кольору (має бути HEX)'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Опис не може бути довшим за 200 символів')
];

module.exports = {
  validateCategory
};