const rateLimit = require('express-rate-limit');

// Базовий rate limiter
const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 хвилин
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // максимум запитів
    message: {
      success: false,
      error: 'Забагато запитів з цієї IP адреси, спробуйте пізніше'
    },
    standardHeaders: true,
    legacyHeaders: false,
  };
  
  return rateLimit({ ...defaults, ...options });
};

// Rate limiter для API
const apiLimiter = createRateLimiter();

// Суворіший rate limiter для авторизації
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 5, // максимум 5 спроб
  skipSuccessfulRequests: true, // не рахувати успішні запити
  message: {
    success: false,
    error: 'Забагато спроб входу, спробуйте через 15 хвилин'
  }
});

// Rate limiter для створення контенту
const createLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 година
  max: 30, // максимум 30 створень на годину
  message: {
    success: false,
    error: 'Досягнуто ліміт створення контенту, спробуйте через годину'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};