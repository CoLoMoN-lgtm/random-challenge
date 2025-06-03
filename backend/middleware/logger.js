const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Створюємо директорію для логів якщо вона не існує
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Створюємо write stream для логів
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

// Кастомний формат для morgan
morgan.token('user', (req) => {
  return req.user ? req.user.username : 'anonymous';
});

morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const sensitiveFields = ['password', 'token'];
    const body = { ...req.body };
    
    // Видаляємо чутливі поля
    sensitiveFields.forEach(field => {
      if (body[field]) {
        body[field] = '[REDACTED]';
      }
    });
    
    return JSON.stringify(body);
  }
  return '';
});

// Формат для development
const devFormat = ':method :url :status :response-time ms - :user';

// Формат для production
const prodFormat = ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :body';

// Middleware функція
const logger = process.env.NODE_ENV === 'production'
  ? morgan(prodFormat, { stream: accessLogStream })
  : morgan(devFormat);

module.exports = logger;