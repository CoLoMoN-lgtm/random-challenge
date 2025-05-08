// scripts/add-more-challenges.js
// Скрипт для додавання додаткових викликів до бази даних

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Конфігурація змінних середовища
dotenv.config();

// Підключення до MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB підключено успішно');
    addMoreChallenges();
  })
  .catch(err => {
    console.error('Помилка підключення до MongoDB:', err);
    process.exit(1);
  });

// Функція для додавання великої кількості викликів
async function addMoreChallenges() {
  try {
    // Імпортуємо моделі
    const Category = require('../models/Category');
    const Challenge = require('../models/Challenge');

    // Отримуємо всі категорії з бази даних
    const categories = await Category.find({});
    
    if (categories.length === 0) {
      console.error('Категорії не знайдено. Спочатку запустіть скрипт seed-mongodb.js');
      mongoose.connection.close();
      return;
    }

    console.log(`Знайдено ${categories.length} категорій. Генеруємо додаткові виклики...`);

    // Великий масив додаткових викликів, розподілений по категоріях
    const additionalChallenges = [
      // Активні виклики
      {
        text: 'Прогуляйтеся без телефону протягом 20 хвилин',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Спробуйте нову фізичну активність, яку ніколи раніше не робили',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'hard'
      },
      {
        text: 'Зробіть 20 стрибків на місці прямо зараз',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Піднімайтеся сходами замість ліфта весь день',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Виконайте 10-хвилинну йогу для початківців',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Танцюйте під свою улюблену пісню повних 3 хвилини',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Зробіть 5 віджимань від підлоги або стіни',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Спробуйте балансувати на одній нозі протягом 30 секунд на кожній нозі',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Виконайте 3-хвилинну розтяжку шиї та плечей',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Підіть на 20-хвилинну прогулянку іншим маршрутом, ніж звичайно',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Зробіть простий комплекс вправ для пресу',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Пострибайте на скакалці протягом 2 хвилин',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Виконайте вправу "планка" протягом 30 секунд',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Спробуйте повільно пройтись як на місці, прислухаючись до свого тіла',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Застеліть ліжко з максимальною енергією та швидкістю',
        categoryId: categories.find(c => c.name === 'Активні')._id,
        difficulty: 'easy'
      },

      // Творчі виклики
      {
        text: 'Намалюйте автопортрет не дивлячись на папір',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Напишіть коротку казку в 6 речень',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Створіть щось корисне з предмета, який ви зазвичай викидаєте',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'hard'
      },
      {
        text: 'Сфотографуйте 5 різних відтінків одного кольору навколо вас',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Напишіть вірш, у якому кожен рядок починається з наступної літери алфавіту',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'hard'
      },
      {
        text: 'Намалюйте те, що бачите за вікном, використовуючи незвичайні кольори',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Створіть шаблон для оригамі та складіть фігурку',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'hard'
      },
      {
        text: 'Напишіть коротке оповідання, починаючи з фрази "Несподівано двері відчинилися..."',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Придумайте новий рецепт, комбінуючи продукти, які у вас є',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Складіть акровірш зі свого імені, де кожен рядок починається на літеру вашого імені',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Створіть закладку для книги з матеріалів, які маєте вдома',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'easy'
      },
      {
        text: 'Створіть невелику скульптуру з предметів, знайдених у вашому домі',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Спробуйте написати вірш у стилі хайку (5-7-5 складів)',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Намалюйте абстрактне зображення свого поточного настрою',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },
      {
        text: 'Напишіть коротку історію про незнайомця, якого ви сьогодні бачили',
        categoryId: categories.find(c => c.name === 'Творчі')._id,
        difficulty: 'medium'
      },

      // Соціальні виклики
      {
        text: 'Залиште позитивний коментар під постом друга в соціальній мережі',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Подзвоніть родичу, з яким давно не спілкувалися',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Висловіть подяку людині, яка вплинула на ваше життя',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Посміхніться і побажайте гарного дня незнайомцю',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Запропонуйте допомогу сусіду або колезі',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Надішліть листівку або повідомлення подяки комусь, хто цього не очікує',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Розкажіть комусь про книгу або фільм, який вас надихнув',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Запросіть когось на чашку чаю або кави',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Зателефонуйте другу і щиро запитайте, як у нього справи',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Визнайте і подякуйте за якесь досягнення вашого друга або колеги',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Надішліть повідомлення з компліментом п\'ятьом друзям',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Поділіться з другом піснею, яка змушує вас думати про них',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Поділіться корисним порадою з кимось, хто її потребує',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Познайомтеся з новою людиною у вашому оточенні',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'hard'
      },
      {
        text: 'Розпочніть розмову з людиною, з якою ви зазвичай не спілкуєтесь',
        categoryId: categories.find(c => c.name === 'Соціальні')._id,
        difficulty: 'medium'
      },

      // Домашні виклики
      {
        text: 'Очистіть екрани всіх електронних пристроїв у вашому домі',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Приготуйте страву кухні, яку ніколи раніше не пробували',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'hard'
      },
      {
        text: 'Організуйте одну шухляду, яку давно відкладали на потім',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Пересадіть або полийте домашні рослини',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Спробуйте зробити домашній освіжувач повітря з натуральних інгредієнтів',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Поставте таймер на 10 хвилин і швидко приберіть якийсь невеликий простір',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Знайдіть 5 речей, які можна віддати, продати або переробити',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Приготуйте здоровий перекус для наступного дня',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'easy'
      },
      {
        text: 'Почистіть і організуйте свою цифрову бібліотеку (фотографії, музика, документи)',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Створіть затишний куточок для читання або відпочинку у своєму домі',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Зробіть генеральне прибирання у холодильнику',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'hard'
      },
      {
        text: 'Організуйте свою цифрову поштову скриньку',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Зробіть власний декор для дому з предметів, які вже маєте',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Спробуйте новий спосіб складання одягу в шафі',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },
      {
        text: 'Проведіть ревізію і організуйте своє робоче місце',
        categoryId: categories.find(c => c.name === 'Домашні')._id,
        difficulty: 'medium'
      },

      // Усвідомлені виклики
      {
        text: 'Проведіть 5 хвилин, спостерігаючи за своїм диханням',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'easy'
      },
      {
        text: 'Проведіть день без соціальних мереж і відзначте, як ви себе почуваєте',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'hard'
      },
      {
        text: 'Випийте склянку води повільно, звертаючи увагу на відчуття',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'easy'
      },
      {
        text: 'Запишіть 5 речей, за які ви вдячні в цей момент',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'easy'
      },
      {
        text: 'Проведіть 10 хвилин на свіжому повітрі, просто спостерігаючи за природою',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'easy'
      },
      {
        text: 'Виконайте сканування тіла: повільно зосередьтеся на кожній частині вашого тіла від пальців ніг до голови',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      },
      {
        text: 'Опишіть свої поточні емоції без оцінювання їх як "хороші" чи "погані"',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      },
      {
        text: 'Зосередьтеся на одному завданні протягом 25 хвилин без перерв і відволікань',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      },
      {
        text: 'Спробуйте медитацію люблячої доброти: направте побажання миру і щастя собі та іншим',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      },
      {
        text: 'Відзначте три звуки, які чуєте в даний момент',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'easy'
      },
      {
        text: 'Напишіть лист подяки самому собі',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      },
      {
        text: 'Виконайте усвідомлену прогулянку, звертаючи увагу на кожен крок',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      },
      {
        text: 'Подивіться на знайомий предмет так, ніби бачите його вперше',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'easy'
      },
      {
        text: 'Проведіть вечір без електронних пристроїв перед сном',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      },
      {
        text: 'Визначте одну річ, яка викликає у вас стрес, і подумайте про конструктивні способи її вирішення',
        categoryId: categories.find(c => c.name === 'Усвідомлені')._id,
        difficulty: 'medium'
      }
    ];

    // Додаємо виклики до бази даних
    const savedChallenges = await Challenge.insertMany(additionalChallenges);
    console.log(`Успішно додано ${savedChallenges.length} нових викликів!`);
    
    // Виводимо підсумкову статистику
    const totalChallenges = await Challenge.countDocuments();
    console.log(`Загальна кількість викликів у базі даних: ${totalChallenges}`);
    
    // Статистика по категоріях
    for (const category of categories) {
      const count = await Challenge.countDocuments({ categoryId: category._id });
      console.log(`- ${category.name}: ${count} викликів`);
    }
    
    // Статистика по рівнях складності
    const easyCount = await Challenge.countDocuments({ difficulty: 'easy' });
    const mediumCount = await Challenge.countDocuments({ difficulty: 'medium' });
    const hardCount = await Challenge.countDocuments({ difficulty: 'hard' });
    
    console.log(`\nРозподіл за складністю:`);
    console.log(`- Легкі: ${easyCount} викликів`);
    console.log(`- Середні: ${mediumCount} викликів`);
    console.log(`- Складні: ${hardCount} викликів`);
    
  } catch (error) {
    console.error('Помилка додавання викликів:', error);
  } finally {
    // Закриваємо підключення до бази даних
    mongoose.connection.close();
    console.log('Підключення до MongoDB закрито');
  }
}