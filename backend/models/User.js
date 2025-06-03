const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Ім\'я користувача обов\'язкове'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Ім\'я користувача має містити мінімум 3 символи'],
    maxlength: [30, 'Ім\'я користувача не може бути довшим за 30 символів'],
    match: [/^[a-z0-9_-]+$/, 'Ім\'я користувача може містити тільки малі літери, цифри, дефіс та підкреслення']
  },
  email: {
    type: String,
    required: [true, 'Email обов\'язковий'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Невірний формат email']
  },
  password: {
    type: String,
    required: [true, 'Пароль обов\'язковий'],
    minlength: [6, 'Пароль має містити мінімум 6 символів'],
    select: false
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Ім\'я не може бути довшим за 100 символів']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  completedChallenges: [{
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  preferences: {
    favoriteCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed'
    },
    dailyGoal: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    }
  },
  stats: {
    totalCompleted: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date,
      default: null
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Індекси
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isActive: 1 });

// Віртуальні поля
userSchema.virtual('completedChallengesCount').get(function() {
  return this.completedChallenges.length;
});

// Middleware
userSchema.pre('save', async function(next) {
  // Хешуємо пароль якщо він змінився
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Методи
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.tokens;
  delete obj.__v;
  return obj;
};

userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign(
    { _id: this._id.toString(), role: this.role },
    process.env.JWT_SECRET || 'defaultsecret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  this.tokens = this.tokens.concat({ token });
  await this.save();
  
  return token;
};

userSchema.methods.checkPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.completeChallenge = async function(challengeId, rating = null) {
  // Перевіряємо чи не виконаний вже цей виклик сьогодні
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const alreadyCompleted = this.completedChallenges.some(cc => 
    cc.challengeId.toString() === challengeId.toString() &&
    cc.completedAt >= today
  );
  
  if (alreadyCompleted) {
    throw new Error('Цей виклик вже виконано сьогодні');
  }
  
  // Додаємо виклик до виконаних
  const completedChallenge = { challengeId, completedAt: new Date() };
  if (rating) completedChallenge.rating = rating;
  
  this.completedChallenges.push(completedChallenge);
  
  // Оновлюємо статистику
  this.stats.totalCompleted += 1;
  
  // Оновлюємо streak
  const lastActivity = this.stats.lastActivityDate;
  const now = new Date();
  
  if (!lastActivity || (now - lastActivity) > 86400000 * 2) {
    // Більше ніж 2 дні - скидаємо streak
    this.stats.currentStreak = 1;
  } else if ((now - lastActivity) > 86400000) {
    // 1-2 дні - продовжуємо streak
    this.stats.currentStreak += 1;
  }
  // Інакше це той самий день - не змінюємо streak
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastActivityDate = now;
  
  // Оновлюємо рейтинг виклику
  if (rating) {
    const Challenge = mongoose.model('Challenge');
    const challenge = await Challenge.findById(challengeId);
    if (challenge) {
      await challenge.addRating(rating);
      await challenge.incrementCompleted();
    }
  }
  
  return this.save();
};

// Статичні методи
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!user) {
    throw new Error('Невірний email або пароль');
  }
  
  const isMatch = await user.checkPassword(password);
  
  if (!isMatch) {
    throw new Error('Невірний email або пароль');
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema);