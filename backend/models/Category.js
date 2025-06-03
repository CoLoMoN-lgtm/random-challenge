const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Назва категорії обов\'язкова'],
    unique: true,
    trim: true,
    maxlength: [50, 'Назва категорії не може бути довшою за 50 символів']
  },
  emoji: {
    type: String,
    required: [true, 'Emoji категорії обов\'язковий'],
    maxlength: [5, 'Emoji не може бути довшим за 5 символів']
  },
  color: {
    type: String,
    required: [true, 'Колір категорії обов\'язковий'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Невірний формат кольору (HEX)']
  },
  description: {
    type: String,
    maxlength: [200, 'Опис не може бути довшим за 200 символів']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Віртуальне поле для підрахунку викликів
categorySchema.virtual('challengeCount', {
  ref: 'Challenge',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
});

// Індекси
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

// Методи
categorySchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Статичні методи
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('Category', categorySchema);