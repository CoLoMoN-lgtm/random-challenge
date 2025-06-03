// MongoDB initialization script for Docker
// This script runs when MongoDB container starts for the first time

db = db.getSiblingDB('random-challenge');

// Create user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'random-challenge'
    }
  ]
});

// Create collections
db.createCollection('categories');
db.createCollection('challenges');

// Insert default categories
db.categories.insertMany([
  {
    name: 'Активні',
    emoji: '🏃',
    description: 'Фізичні активності та вправи'
  },
  {
    name: 'Творчі',
    emoji: '🎨',
    description: 'Творчі завдання та мистецтво'
  },
  {
    name: 'Соціальні',
    emoji: '🤝',
    description: 'Взаємодія з людьми'
  },
  {
    name: 'Домашні',
    emoji: '🏠',
    description: 'Домашні справи та організація'
  },
  {
    name: 'Усвідомлені',
    emoji: '🧘',
    description: 'Медитація та усвідомленість'
  }
]);

// Get category IDs
const categories = db.categories.find().toArray();
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.name] = cat._id;
});

// Insert sample challenges
db.challenges.insertMany([
  // Активні
  {
    text: 'Зробіть 20 присідань',
    categoryId: categoryMap['Активні'],
    difficulty: 'easy'
  },
  {
    text: 'Пробіжіть 2 км',
    categoryId: categoryMap['Активні'],
    difficulty: 'medium'
  },
  {
    text: 'Зробіть 50 віджимань протягом дня',
    categoryId: categoryMap['Активні'],
    difficulty: 'hard'
  },
  
  // Творчі
  {
    text: 'Намалюйте щось за 5 хвилин',
    categoryId: categoryMap['Творчі'],
    difficulty: 'easy'
  },
  {
    text: 'Напишіть коротке оповідання на 500 слів',
    categoryId: categoryMap['Творчі'],
    difficulty: 'medium'
  },
  {
    text: 'Створіть музичну композицію',
    categoryId: categoryMap['Творчі'],
    difficulty: 'hard'
  },
  
  // Соціальні
  {
    text: 'Подзвоніть другу, з яким давно не спілкувались',
    categoryId: categoryMap['Соціальні'],
    difficulty: 'easy'
  },
  {
    text: 'Організуйте зустріч з друзями',
    categoryId: categoryMap['Соціальні'],
    difficulty: 'medium'
  },
  {
    text: 'Проведіть майстер-клас для когось',
    categoryId: categoryMap['Соціальні'],
    difficulty: 'hard'
  },
  
  // Домашні
  {
    text: 'Приберіть робочий стіл',
    categoryId: categoryMap['Домашні'],
    difficulty: 'easy'
  },
  {
    text: 'Приготуйте нову страву',
    categoryId: categoryMap['Домашні'],
    difficulty: 'medium'
  },
  {
    text: 'Зробіть генеральне прибирання однієї кімнати',
    categoryId: categoryMap['Домашні'],
    difficulty: 'hard'
  },
  
  // Усвідомлені
  {
    text: 'Медитуйте 10 хвилин',
    categoryId: categoryMap['Усвідомлені'],
    difficulty: 'easy'
  },
  {
    text: 'Ведіть щоденник вдячності протягом тижня',
    categoryId: categoryMap['Усвідомлені'],
    difficulty: 'medium'
  },
  {
    text: 'Проведіть день без соціальних мереж',
    categoryId: categoryMap['Усвідомлені'],
    difficulty: 'hard'
  }
]);

print('Database initialized successfully!');