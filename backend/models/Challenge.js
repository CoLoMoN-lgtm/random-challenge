const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Текст виклику обов\'язковий'],
    trim: true,
    minlength: [10, 'Текст виклику має містити мінімум 10 символів'],
    maxlength: [500, 'Текст виклику не може бути довшим за 500 символів']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Категорія виклику обов\'язкова']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Складність має бути: easy, medium або hard'
    },
    default: 'medium'
  },
  timeEstimate: {
    type: Number,
    min: [1, 'Час виконання має бути мінімум 1 хвилина'],
    max: [180, 'Час виконання не може перевищувати 180 хвилин'],
    default: 15
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  completedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Індекси
challengeSchema.index({ categoryId: 1, difficulty: 1 });
challengeSchema.index({ tags: 1 });
challengeSchema.index({ isActive: 1 });
challengeSchema.index({ rating: -1 });
challengeSchema.index({ completedCount: -1 });
challengeSchema.index({ createdAt: -1 });

// Віртуальні поля
challengeSchema.virtual('averageRating').get(function() {
  if (this.ratingCount === 0) return 0;
  return Math.round((this.rating / this.ratingCount) * 10) / 10;
});

// Middleware
challengeSchema.pre('save', async function(next) {
  // Перевіряємо чи існує категорія
  if (this.isModified('categoryId')) {
    const Category = mongoose.model('Category');
    const categoryExists = await Category.exists({ _id: this.categoryId });
    if (!categoryExists) {
      throw new Error('Вказана категорія не існує');
    }
  }
  next();
});

// Методи
challengeSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

challengeSchema.methods.incrementCompleted = async function() {
  this.completedCount += 1;
  return this.save();
};

challengeSchema.methods.addRating = async function(rating) {
  this.rating += rating;
  this.ratingCount += 1;
  return this.save();
};

// Статичні методи
challengeSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

challengeSchema.statics.findByCategory = function(categoryId) {
  return this.find({ categoryId, isActive: true });
};

challengeSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true });
};

challengeSchema.statics.getRandomChallenge = async function(filter = {}) {
  const query = { isActive: true, ...filter };
  const count = await this.countDocuments(query);
  
  if (count === 0) {
    return null;
  }
  
  const random = Math.floor(Math.random() * count);
  return this.findOne(query).skip(random).populate('categoryId');
};

module.exports = mongoose.model('Challenge', challengeSchema);