require('dotenv').config();
const mongoose = require('mongoose');
const { Category, Challenge, User } = require('../models');

const seedData = async () => {
  try {
    // Підключення до бази даних
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/random-challenge');
    console.log('✅ Підключено до MongoDB');
    
    // Перевіряємо чи потрібен reset
    const reset = process.argv.includes('--reset');
    
    if (reset) {
      console.log('🗑️  Очищення бази даних...');
      await Promise.all([
        Category.deleteMany({}),
        Challenge.deleteMany({}),
        User.deleteMany({})
      ]);
      console.log('✅ База даних очищена');
    }
    
    // Перевіряємо чи вже є дані
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0 && !reset) {
      console.log('ℹ️  База даних вже містить дані. Використайте --reset для повного оновлення');
      process.exit(0);
    }
    
    // Створюємо категорії
    console.log('📁 Створення категорій...');
    const categories = await Category.insertMany([
      {
        name: 'Активні',
        emoji: '🏃',
        color: '#ff6b6b',
        description: 'Фізичні вправи та активності'
      },
      {
        name: 'Творчі',
        emoji: '🎨',
        color: '#9c88ff',
        description: 'Творчі завдання та мистецтво'
      },
      {
        name: 'Соціальні',
        emoji: '👥',
        color: '#4ecdc4',
        description: 'Взаємодія з людьми'
      },
      {
        name: 'Домашні',
        emoji: '🏠',
        color: '#45b7d1',
        description: 'Домашні справи та організація'
      },
      {
        name: 'Усвідомлені',
        emoji: '🧘',
        color: '#96ceb4',
        description: 'Медитація та усвідомленість'
      },
      {
        name: 'Освітні',
        emoji: '📚',
        color: '#f9ca24',
        description: 'Навчання та розвиток'
      },
      {
        name: 'Кулінарні',
        emoji: '🍳',
        color: '#ff7979',
        description: 'Готування та їжа'
      },
      {
        name: 'Природа',
        emoji: '🌿',
        color: '#6ab04c',
        description: 'Активності на природі'
      }
    ]);
    console.log(`✅ Створено ${categories.length} категорій`);
    
    // Створюємо виклики
    console.log('🎯 Створення викликів...');
    const challengesData = [
      // Активні
      { text: 'Пройдіться на свіжому повітрі 15 хвилин', categoryId: categories[0]._id, difficulty: 'easy', timeEstimate: 15, tags: ['прогулянка', 'здоров\'я'] },
      { text: 'Зробіть 20 присідань', categoryId: categories[0]._id, difficulty: 'medium', timeEstimate: 5, tags: ['вправи', 'фітнес'] },
      { text: 'Потанцюйте під 3 улюблені пісні', categoryId: categories[0]._id, difficulty: 'easy', timeEstimate: 10, tags: ['танці', 'весело'] },
      { text: 'Зробіть планку 1 хвилину', categoryId: categories[0]._id, difficulty: 'hard', timeEstimate: 2, tags: ['вправи', 'сила'] },
      { text: 'Пробіжіть 2 км', categoryId: categories[0]._id, difficulty: 'hard', timeEstimate: 20, tags: ['біг', 'кардіо'] },
      
      // Творчі
      { text: 'Намалюйте щось використовуючи лише 3 кольори', categoryId: categories[1]._id, difficulty: 'medium', timeEstimate: 30, tags: ['малювання', 'творчість'] },
      { text: 'Напишіть короткий вірш про сьогоднішній день', categoryId: categories[1]._id, difficulty: 'medium', timeEstimate: 15, tags: ['письмо', 'поезія'] },
      { text: 'Зробіть 5 фото на одну тему', categoryId: categories[1]._id, difficulty: 'easy', timeEstimate: 20, tags: ['фотографія', 'творчість'] },
      { text: 'Створіть оригамі з паперу', categoryId: categories[1]._id, difficulty: 'hard', timeEstimate: 45, tags: ['рукоділля', 'папір'] },
      { text: 'Придумайте та заспівайте коротку пісню', categoryId: categories[1]._id, difficulty: 'medium', timeEstimate: 10, tags: ['музика', 'спів'] },
      
      // Соціальні
      { text: 'Напишіть повідомлення старому другу', categoryId: categories[2]._id, difficulty: 'easy', timeEstimate: 10, tags: ['спілкування', 'друзі'] },
      { text: 'Подзвоніть рідним та поговоріть 10 хвилин', categoryId: categories[2]._id, difficulty: 'easy', timeEstimate: 15, tags: ['родина', 'спілкування'] },
      { text: 'Зробіть комплімент 3 різним людям', categoryId: categories[2]._id, difficulty: 'medium', timeEstimate: 30, tags: ['доброта', 'спілкування'] },
      { text: 'Познайомтеся з новою людиною', categoryId: categories[2]._id, difficulty: 'hard', timeEstimate: 20, tags: ['знайомства', 'сміливість'] },
      { text: 'Організуйте спільну активність з друзями', categoryId: categories[2]._id, difficulty: 'medium', timeEstimate: 60, tags: ['друзі', 'планування'] },
      
      // Домашні
      { text: 'Прибрайте робочий стіл', categoryId: categories[3]._id, difficulty: 'easy', timeEstimate: 15, tags: ['прибирання', 'організація'] },
      { text: 'Приготуйте новий рецепт', categoryId: categories[3]._id, difficulty: 'medium', timeEstimate: 60, tags: ['готування', 'кухня'] },
      { text: 'Полийте всі рослини та поговоріть з ними', categoryId: categories[3]._id, difficulty: 'easy', timeEstimate: 10, tags: ['рослини', 'догляд'] },
      { text: 'Реорганізуйте одну шафу або ящик', categoryId: categories[3]._id, difficulty: 'hard', timeEstimate: 45, tags: ['організація', 'порядок'] },
      { text: 'Помийте всі вікна в кімнаті', categoryId: categories[3]._id, difficulty: 'medium', timeEstimate: 30, tags: ['прибирання', 'чистота'] },
      
      // Усвідомлені
      { text: 'Медитуйте 10 хвилин', categoryId: categories[4]._id, difficulty: 'easy', timeEstimate: 10, tags: ['медитація', 'спокій'] },
      { text: 'Запишіть 5 речей за які ви вдячні', categoryId: categories[4]._id, difficulty: 'easy', timeEstimate: 10, tags: ['вдячність', 'рефлексія'] },
      { text: 'Практикуйте глибоке дихання 5 хвилин', categoryId: categories[4]._id, difficulty: 'medium', timeEstimate: 5, tags: ['дихання', 'релаксація'] },
      { text: 'Проведіть 30 хвилин без телефону та гаджетів', categoryId: categories[4]._id, difficulty: 'hard', timeEstimate: 30, tags: ['детокс', 'усвідомленість'] },
      { text: 'Ведіть щоденник протягом 15 хвилин', categoryId: categories[4]._id, difficulty: 'medium', timeEstimate: 15, tags: ['письмо', 'рефлексія'] },
      
      // Освітні
      { text: 'Прочитайте 20 сторінок книги', categoryId: categories[5]._id, difficulty: 'medium', timeEstimate: 30, tags: ['читання', 'знання'] },
      { text: 'Перегляньте освітнє відео на YouTube', categoryId: categories[5]._id, difficulty: 'easy', timeEstimate: 20, tags: ['навчання', 'відео'] },
      { text: 'Вивчіть 10 нових слів іноземною мовою', categoryId: categories[5]._id, difficulty: 'medium', timeEstimate: 30, tags: ['мови', 'навчання'] },
      { text: 'Розв\'яжіть головоломку або кросворд', categoryId: categories[5]._id, difficulty: 'medium', timeEstimate: 20, tags: ['логіка', 'мозок'] },
      { text: 'Навчіть когось чомусь новому', categoryId: categories[5]._id, difficulty: 'hard', timeEstimate: 30, tags: ['навчання', 'ділитися'] },
      
      // Кулінарні
      { text: 'Приготуйте здоровий сніданок', categoryId: categories[6]._id, difficulty: 'easy', timeEstimate: 20, tags: ['готування', 'здоров\'я'] },
      { text: 'Спечіть щось солодке', categoryId: categories[6]._id, difficulty: 'medium', timeEstimate: 60, tags: ['випічка', 'десерт'] },
      { text: 'Зробіть свіжий сік або смузі', categoryId: categories[6]._id, difficulty: 'easy', timeEstimate: 10, tags: ['напої', 'здоров\'я'] },
      { text: 'Приготуйте страву з 5 інгредієнтів', categoryId: categories[6]._id, difficulty: 'medium', timeEstimate: 30, tags: ['готування', 'простота'] },
      { text: 'Створіть власний рецепт', categoryId: categories[6]._id, difficulty: 'hard', timeEstimate: 60, tags: ['творчість', 'кухня'] },
      
      // Природа
      { text: 'Посадіть рослину або квітку', categoryId: categories[7]._id, difficulty: 'medium', timeEstimate: 30, tags: ['садівництво', 'рослини'] },
      { text: 'Спостерігайте за хмарами 10 хвилин', categoryId: categories[7]._id, difficulty: 'easy', timeEstimate: 10, tags: ['релакс', 'природа'] },
      { text: 'Зберіть букет польових квітів', categoryId: categories[7]._id, difficulty: 'easy', timeEstimate: 20, tags: ['квіти', 'прогулянка'] },
      { text: 'Влаштуйте пікнік на природі', categoryId: categories[7]._id, difficulty: 'hard', timeEstimate: 120, tags: ['відпочинок', 'їжа'] },
      { text: 'Сфотографуйте схід або захід сонця', categoryId: categories[7]._id, difficulty: 'medium', timeEstimate: 30, tags: ['фото', 'краса'] }
    ];
    
    const challenges = await Challenge.insertMany(challengesData);
    console.log(`✅ Створено ${challenges.length} викликів`);
    
    // Створюємо тестових користувачів
    console.log('👤 Створення тестових користувачів...');
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123',
        name: 'Адміністратор',
        role: 'admin',
        emailVerified: true
      },
      {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123',
        name: 'Тестовий користувач',
        role: 'user',
        emailVerified: true
      }
    ]);
    console.log(`✅ Створено ${users.length} користувачів`);
    
    console.log('\n📊 Підсумок:');
    console.log(`- Категорій: ${categories.length}`);
    console.log(`- Викликів: ${challenges.length}`);
    console.log(`- Користувачів: ${users.length}`);
    console.log('\n✨ Seed завершено успішно!');
    
    console.log('\n🔑 Тестові облікові записи:');
    console.log('Admin: admin@example.com / Admin123');
    console.log('User: test@example.com / Test123');
    
  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 З\'єднання з БД закрито');
    process.exit(0);
  }
};

// Запускаємо seed
seedData();