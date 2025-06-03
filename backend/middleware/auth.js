const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware для аутентифікації
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
      isActive: true
    });
    
    if (!user) {
      throw new Error();
    }
    
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Будь ласка, авторизуйтесь'
    });
  }
};

// Middleware для опціональної аутентифікації
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
      const user = await User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        isActive: true
      });
      
      if (user) {
        req.token = token;
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ігноруємо помилки токену для опціональної авторизації
    next();
  }
};

// Middleware для авторизації за ролями
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Авторизація відсутня'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Недостатньо прав для виконання цієї дії'
      });
    }
    
    next();
  };
};

module.exports = {
  auth,
  optionalAuth,
  authorize
};