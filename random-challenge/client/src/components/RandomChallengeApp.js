import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Filter, PlusCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from './AuthProvider';
import { addCompletedChallenge, getCompletedChallenges } from '../utils/firestore';

const RandomChallengeApp = () => {
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewChallengeForm, setShowNewChallengeForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    text: '',
    categoryId: '',
    difficulty: 'medium'
  });

  // Базовий URL API
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const { user } = useAuth(); // Змінено з currentUser на user
  const [completedChallenges, setCompletedChallenges] = useState([]);

  useEffect(() => {
    const fetchCompletedChallenges = async () => {
      if (user) {
        try {
          const completed = await getCompletedChallenges(user.uid);
          setCompletedChallenges(completed);
        } catch (error) {
          console.log('Помилка завантаження виконаних челенджів:', error.message);
          setCompletedChallenges([]);
        }
      }
    };

    fetchCompletedChallenges();
  }, [user]);

  const handleMarkAsCompleted = async () => {
    if (user && currentChallenge) {
      try {
        await addCompletedChallenge(user.uid, currentChallenge._id);
        setCompletedChallenges((prev) => [...prev, currentChallenge._id]);
      } catch (error) {
        console.log('Помилка збереження виконаного челенджу:', error.message);
        // Все одно додаємо до локального стану
        setCompletedChallenges((prev) => [...prev, currentChallenge._id]);
      }
    }
  };

  // Завантаження даних з API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Отримуємо категорії з API
        const categoriesResponse = await axios.get(`${API_URL}/categories`);
        setCategories(categoriesResponse.data);

        // Отримуємо виклики з API
        const challengesResponse = await axios.get(`${API_URL}/challenges`);
        setChallenges(challengesResponse.data);
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
        setError('Не вдалося завантажити дані. Перевірте підключення до сервера.');

        // Демонстраційні дані для офлайн-режиму
        setCategories([
          { _id: 'active', name: 'Активні', color: 'bg-red-500' },
          { _id: 'creative', name: 'Творчі', color: 'bg-purple-500' },
          { _id: 'social', name: 'Соціальні', color: 'bg-blue-500' },
          { _id: 'home', name: 'Домашні', color: 'bg-green-500' },
          { _id: 'mindful', name: 'Усвідомлені', color: 'bg-yellow-500' }
        ]);

        setChallenges([
          { _id: '1', text: 'Пройдіться на свіжому повітрі протягом 15 хвилин', categoryId: 'active', difficulty: 'easy' },
          { _id: '2', text: 'Виконайте 10 присідань прямо зараз', categoryId: 'active', difficulty: 'medium' },
          { _id: '3', text: 'Намалюйте щось, використовуючи лише три кольори', categoryId: 'creative', difficulty: 'medium' },
          { _id: '4', text: 'Надішліть повідомлення старому другу', categoryId: 'social', difficulty: 'easy' },
          { _id: '5', text: 'Приготуйте новий рецепт', categoryId: 'home', difficulty: 'medium' },
          { _id: '6', text: 'Проведіть 5 хвилин у медитації', categoryId: 'mindful', difficulty: 'easy' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // Отримання випадкового виклику
  const getRandomChallenge = async () => {
    setLoading(true);
    setError(null);

    try {
      // Використовуємо API для отримання випадкового виклику
      let response;

      if (selectedCategory === 'all') {
        // Запит випадкового виклику з усіх категорій
        response = await axios.get(`${API_URL}/challenges/random`);
      } else {
        // Запит випадкового виклику з вибраної категорії
        response = await axios.get(`${API_URL}/challenges/random?category=${selectedCategory}`);
      }

      setCurrentChallenge(response.data);
    } catch (err) {
      console.error('Помилка отримання випадкового виклику:', err);
      setError('Не вдалося отримати виклик. Перевірте підключення до сервера.');

      // Якщо API недоступний, імітуємо випадковий виклик локально
      const filteredChallenges = challenges.filter(challenge =>
        selectedCategory === 'all' || challenge.categoryId === selectedCategory
      );

      if (filteredChallenges.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
        setCurrentChallenge(filteredChallenges[randomIndex]);
      } else {
        setCurrentChallenge(null);
        setError('У цій категорії немає викликів');
      }
    } finally {
      setLoading(false);
    }
  };

  // Додавання нового виклику
  const handleAddNewChallenge = async () => {
    if (!newChallenge.text || !newChallenge.categoryId) {
      setError('Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Відправляємо новий виклик на сервер через API
      const response = await axios.post(`${API_URL}/challenges`, newChallenge);

      // Оновлюємо локальний стан
      setChallenges([...challenges, response.data]);
      setNewChallenge({ text: '', categoryId: '', difficulty: 'medium' });
      setShowNewChallengeForm(false);

      // Показуємо новий виклик
      setCurrentChallenge(response.data);
    } catch (err) {
      console.error('Помилка додавання виклику:', err);
      setError('Не вдалося зберегти виклик. Можливо, сервер недоступний.');

      // Локальна імітація
      const newId = (challenges.length + 1).toString();
      const challengeToAdd = {
        _id: newId,
        ...newChallenge
      };

      setChallenges([...challenges, challengeToAdd]);
      setNewChallenge({ text: '', categoryId: '', difficulty: 'medium' });
      setShowNewChallengeForm(false);
      setCurrentChallenge(challengeToAdd);
    } finally {
      setLoading(false);
    }
  };

  // Отримання кольору категорії для поточного виклику
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.color : 'bg-gray-500';
  };

  // Отримання назви категорії
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Загальне';
  };

  // Отримання класу для рівня складності
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-200 text-green-800';
      case 'medium': return 'bg-yellow-200 text-yellow-800';
      case 'hard': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Отримання назви рівня складності українською
  const getDifficultyName = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Середній';
      case 'hard': return 'Складний';
      default: return 'Невідомо';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center p-4">
      <header className="text-center mb-8 mt-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
          <Sparkles className="mr-2" size={32} /> Випадковий виклик
        </h1>
        <p className="text-white text-xl">Відкрийте для себе маленькі пригоди</p>
      </header>

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
        {/* Вибір категорії */}
        <div className="mb-6">
          <label className="flex items-center text-lg text-gray-700 mb-2">
            <Filter size={20} className="mr-2" /> Оберіть категорію:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
            >
              Всі категорії
            </button>

            {categories.map(category => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category._id
                  ? `${category.color} text-white`
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка генерації випадкового виклику */}
        <div className="flex justify-center mb-8">
          <button
            onClick={getRandomChallenge}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <RefreshCw size={24} className="mr-2 animate-spin" /> Генеруємо...
              </>
            ) : (
              <>
                <Sparkles size={24} className="mr-2" /> Отримати виклик!
              </>
            )}
          </button>
        </div>

        {/* Відображення поточного виклику */}
        {currentChallenge && !loading && (
          <div className="animate-fade-in">
            <div className={`p-6 rounded-lg mb-4 border-l-8 ${getCategoryColor(currentChallenge.categoryId)}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getDifficultyClass(currentChallenge.difficulty)}`}>
                  {getDifficultyName(currentChallenge.difficulty)}
                </span>
                <span className="text-sm text-gray-600">
                  {getCategoryName(currentChallenge.categoryId)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{currentChallenge.text}</h2>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleMarkAsCompleted}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  completedChallenges.includes(currentChallenge._id)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
                }`}
                disabled={completedChallenges.includes(currentChallenge._id)}
              >
                {completedChallenges.includes(currentChallenge._id) ? '✓ Виконано' : 'Відзначити як виконане'}
              </button>
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={getRandomChallenge}
                className="text-purple-600 flex items-center hover:text-purple-800 transition-colors"
              >
                <RefreshCw size={16} className="mr-1" /> Спробувати інший виклик
              </button>
            </div>
          </div>
        )}

        {/* Повідомлення про помилку */}
        {error && (
          <div className="mt-6 max-w-2xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Коли немає результатів у вибраній категорії */}
        {!error && selectedCategory !== 'all' && challenges.filter(c => c.categoryId === selectedCategory).length === 0 && (
          <div className="text-center p-6 text-gray-500">
            У цій категорії поки немає викликів. Додайте новий!
          </div>
        )}

        {/* Кнопка для додавання нового виклику */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowNewChallengeForm(!showNewChallengeForm)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center mx-auto"
          >
            <PlusCircle size={16} className="mr-1" />
            {showNewChallengeForm ? 'Скасувати' : 'Додати свій виклик'}
          </button>
        </div>

        {/* Форма додавання нового виклику */}
        {showNewChallengeForm && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Новий виклик</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Текст виклику:
              </label>
              <input
                type="text"
                value={newChallenge.text}
                onChange={(e) => setNewChallenge({ ...newChallenge, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Введіть опис виклику"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категорія:
              </label>
              <select
                value={newChallenge.categoryId}
                onChange={(e) => setNewChallenge({ ...newChallenge, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Оберіть категорію</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Складність:
              </label>
              <div className="flex flex-wrap gap-3">
                {['easy', 'medium', 'hard'].map(difficulty => (
                  <label key={difficulty} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={difficulty}
                      checked={newChallenge.difficulty === difficulty}
                      onChange={() => setNewChallenge({ ...newChallenge, difficulty })}
                      className="mr-1"
                    />
                    <span className={`text-sm px-2 py-1 rounded-full ${getDifficultyClass(difficulty)}`}>
                      {getDifficultyName(difficulty)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddNewChallenge}
              disabled={!newChallenge.text || !newChallenge.categoryId || loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Збереження...' : 'Зберегти виклик'}
            </button>
          </div>
        )}
      </div>

      {/* Статус підключення до бекенду */}
      <div className="mt-8 text-white text-center max-w-2xl">
        <p className="mb-2 font-medium">💾 Підключення до бази даних</p>
        <p className="text-sm opacity-80">
          {error
            ? 'Працює в офлайн-режимі з тестовими даними. Перевірте підключення до сервера.'
            : 'Підключено до MongoDB через API. Дані завантажуються з бази даних.'
          }
        </p>
      </div>
    </div>
  );
};

export default RandomChallengeApp;