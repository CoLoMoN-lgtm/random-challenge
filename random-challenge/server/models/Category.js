const mongoose = require('mongoose');

// Перевіряємо, чи модель вже існує, щоб уникнути помилки OverwriteModelError
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  color: {
    type: String,
    required: true,
    default: 'bg-gray-500'
  },
  // Опціонально можна додати поля для розширеного функціоналу
  icon: {
    type: String,
    default: 'sparkles'
  },
  order: {
    type: Number,
    default: 0
  }
}));

module.exports = Category;