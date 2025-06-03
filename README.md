# Random Challenge - Випадковий виклик

Веб-додаток для генерації випадкових малих пригод і викликів з використанням Node.js та MongoDB.

## Про проект

"Випадковий виклик" - це інтерактивний веб-додаток, який пропонує користувачам різноманітні невеликі завдання-виклики для урізноманітнення свого дня. Виклики поділені на категорії (активні, творчі, соціальні, домашні, усвідомлені) та мають різні рівні складності.

### Особливості

- Генерація випадкових викликів з різних категорій
- Фільтрація за категоріями
- Додавання власних викликів
- Зберігання даних у MongoDB
- RESTful API на Express.js
- Докеризація для легкого розгортання
- CI/CD через GitHub Actions
- Підтримка деплою на Vercel, Render, Railway

## Швидкий старт

### Використання Docker Compose (рекомендовано)

```bash
# Клонування репозиторію
git clone https://github.com/your-username/random-challenge.git
cd random-challenge

# Створити файл .env з налаштуваннями
cp .env.production .env

# Запустити додаток через Docker Compose
docker-compose up -d

# Переглянути логи
docker-compose logs -f
```

Додаток буде доступний:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Локальна розробка

#### Вимоги

- Node.js (v16 або вище)
- npm або yarn
- MongoDB (локально або MongoDB Atlas)

#### Встановлення

```bash
# Клонування репозиторію
git clone https://github.com/your-username/random-challenge.git
cd random-challenge

# Встановлення залежностей для backend
cd backend
npm install

# Створити файл .env
cp ../.env.production .env
# Відредагуйте .env файл з вашими налаштуваннями

# Запуск backend
npm run dev
```

Frontend (статичний HTML) можна відкрити безпосередньо в браузері або запустити через простий HTTP сервер:

```bash
# З кореневої директорії проекту
npx http-server . -p 3000
```

## Деплой

### Frontend - Vercel

1. Зареєструйтесь на [Vercel](https://vercel.com)
2. Встановіть Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Деплой:
   ```bash
   vercel
   ```
4. Додайте змінну середовища `API_URL` з адресою вашого backend

### Backend - Render

1. Зареєструйтесь на [Render](https://render.com)
2. Створіть новий Web Service
3. Підключіть GitHub репозиторій
4. Використовуйте наступні налаштування:
   - Build Command: `cd backend && npm ci --only=production`
   - Start Command: `cd backend && node server.js`
5. Додайте змінні середовища:
   - `MONGODB_URI` - підключення до MongoDB
   - `JWT_SECRET` - секретний ключ для JWT
   - `CORS_ORIGIN` - URL вашого frontend

### Backend - Railway

1. Зареєструйтесь на [Railway](https://railway.app)
2. Створіть новий проект
3. Додайте MongoDB plugin
4. Deploy з GitHub:
   ```bash
   railway login
   railway link
   railway up
   ```
5. Додайте змінні середовища через Railway Dashboard

### Docker Hub

```bash
# Build images
docker build -t your-username/random-challenge-backend ./backend
docker build -t your-username/random-challenge-frontend -f Dockerfile.frontend .

# Push to Docker Hub
docker push your-username/random-challenge-backend
docker push your-username/random-challenge-frontend
```

## CI/CD

Проект налаштований з GitHub Actions для автоматичного:
- Тестування коду при кожному push
- Збірки Docker образів
- Деплою на Vercel (frontend) та Render (backend)

Для налаштування додайте наступні секрети в GitHub:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `RENDER_API_KEY` - Render API key
- `RENDER_SERVICE_ID` - Render service ID

## API Ендпоінти

### Категорії

- `GET /api/categories` - Отримати всі категорії
- `GET /api/categories/:id` - Отримати категорію за ID
- `POST /api/categories` - Створити нову категорію

### Виклики

- `GET /api/challenges` - Отримати всі виклики (з опціональною фільтрацією за категорією)
- `GET /api/challenges/random` - Отримати випадковий виклик (з опціональною фільтрацією за категорією)
- `GET /api/challenges/:id` - Отримати виклик за ID
- `POST /api/challenges` - Створити новий виклик

### Інше

- `GET /api/stats` - Отримати статистику
- `GET /api/health` - Перевірка стану сервера

## Змінні середовища

Створіть файл `.env` в кореневій директорії проекту:

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/random-challenge
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend (in index.html)
API_URL=https://your-backend-api.com/api
```

## Структура проекту

```
random-challenge/
├── backend/               # Backend API
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── server.js         # Main server file
├── .github/              # GitHub Actions workflows
│   └── workflows/
│       └── ci-cd.yml
├── index.html            # Frontend (single page)
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile.frontend   # Frontend Docker configuration
├── nginx.conf           # Nginx configuration
├── vercel.json          # Vercel configuration
├── render.yaml          # Render configuration
├── railway.json         # Railway configuration
└── README.md            # This file
```

## Вирішення проблем

### Проблеми підключення до MongoDB

1. Переконайтеся, що MongoDB запущено
2. Перевірте правильність `MONGODB_URI`
3. Для MongoDB Atlas додайте вашу IP-адресу до білого списку

### Проблеми з CORS

1. Перевірте значення `CORS_ORIGIN` в `.env`
2. Переконайтеся, що frontend і backend використовують правильні URL

### Docker проблеми

```bash
# Перезапустити контейнери
docker-compose restart

# Переглянути логи
docker-compose logs backend

# Повністю перезапустити
docker-compose down
docker-compose up --build
```

## Ліцензія

Цей проект ліцензовано під [MIT License](LICENSE).