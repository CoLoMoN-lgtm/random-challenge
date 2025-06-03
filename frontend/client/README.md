# Random Challenge Generator - Frontend

React додаток для генерації випадкових челенджів.

## Встановлення

```bash
npm install
```

## Запуск в режимі розробки

```bash
npm start
```

Додаток буде доступний на http://localhost:3000

## Збірка для продакшену

```bash
npm run build
```

## Структура проекту

```
src/
├── components/          # React компоненти
│   ├── Header.js       # Заголовок додатку
│   ├── CategorySelector.js  # Вибір категорій
│   ├── ChallengeDisplay.js  # Відображення челенджу
│   ├── AddChallengeForm.js  # Форма додавання
│   ├── ConnectionStatus.js  # Статус підключення
│   ├── LoadingSpinner.js    # Індикатор завантаження
│   └── ErrorMessage.js      # Повідомлення про помилки
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.js   # Hook для localStorage
│   └── useForm.js          # Hook для форм
├── styles/             # Стилі
│   └── GlobalStyle.js      # Глобальні стилі
├── utils/              # Утиліти
│   └── api.js             # API функції
├── App.js              # Головний компонент
└── index.js            # Точка входу
```

## Особливості

- Респонсивний дизайн
- Styled Components для стилізації
- React Hooks для управління станом
- Axios для HTTP запитів
- Обробка помилок та станів завантаження
- Автоматична перевірка підключення до сервера
- PWA підтримка

## API Endpoints

Додаток використовує наступні API endpoints:

- `GET /api/categories` - отримати список категорій
- `GET /api/challenge/random` - отримати випадковий челендж
- `GET /api/challenge/random/:category` - отримати челендж за категорією
- `POST /api/challenge` - додати новий челендж
- `GET /api/health` - перевірка статусу сервера

## Налаштування

Для зміни URL API сервера створіть файл `.env` в кореневій папці:

```
REACT_APP_API_URL=http://localhost:3001
```