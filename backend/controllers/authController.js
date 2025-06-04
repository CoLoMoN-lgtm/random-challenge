const { User } = require('../models');
const { validationResult } = require('express-validator');

// Реєстрація користувача
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { username, email, password, name } = req.body;
    
    // Перевіряємо чи не існує вже такий користувач
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email
          ? 'Користувач з таким email вже існує'
          : 'Це ім\'я користувача вже зайняте'
      });
    }
    
    // Створюємо користувача
    const user = await User.create({
      username,
      email,
      password,
      name
    });
    
    // Генеруємо токен
    const token = await user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Вхід користувача
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { email, password } = req.body;
    
    // Знаходимо користувача та перевіряємо пароль
    const user = await User.findByCredentials(email, password);
    
    // Генеруємо токен
    const token = await user.generateAuthToken();
    
    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// Вихід користувача
exports.logout = async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter(tokenObj => 
      tokenObj.token !== req.token
    );
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Успішно вийшли з системи'
    });
  } catch (error) {
    next(error);
  }
};

// Вихід з усіх пристроїв
exports.logoutAll = async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Успішно вийшли з усіх пристроїв'
    });
  } catch (error) {
    next(error);
  }
};

// Отримати профіль користувача
exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

// Оновити профіль користувача
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const allowedUpdates = ['name', 'avatar', 'preferences'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update)
    );
    
    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        error: 'Недозволені поля для оновлення'
      });
    }
    
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });
    
    await req.user.save();
    
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Змінити пароль
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Перевіряємо поточний пароль
    const isMatch = await req.user.checkPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Невірний поточний пароль'
      });
    }
    
    // Оновлюємо пароль
    req.user.password = newPassword;
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Пароль успішно змінено'
    });
  } catch (error) {
    next(error);
  }
};