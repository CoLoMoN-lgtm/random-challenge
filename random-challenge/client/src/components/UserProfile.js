// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { User, Trophy, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { getCompletedChallenges } from '../utils/firestore';
import axios from 'axios';

const UserProfile = ({ onBack }) => {
  const { user } = useAuth();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [challengeDetails, setChallengeDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {},
    byDifficulty: {}
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Отримуємо список виконаних челенджів з Firestore
        const completedIds = await getCompletedChallenges(user.uid);
        setCompletedChallenges(completedIds);

        // Демонстраційні категорії для офлайн-режиму
        const defaultCategories = [
          { _id: 'active', name: 'Активні', color: 'bg-red-500' },
          { _id: 'creative', name: 'Творчі', color: 'bg-purple-500' },
          { _id: 'social', name: 'Соціальні', color: 'bg-blue-500' },
          { _id: 'home', name: 'Домашні', color: 'bg-green-500' },
          { _id: 'mindful', name: 'Усвідомлені', color: 'bg-yellow-500' }
        ];

        const defaultChallenges = [
          { _id: '1', text: 'Пройдіться на свіжому повітрі протягом 15 хвилин', categoryId: 'active', difficulty: 'easy' },
          { _id: '2', text: 'Виконайте 10 присідань прямо зараз', categoryId: 'active', difficulty: 'medium' },
          { _id: '3', text: 'Намалюйте щось, використовуючи лише три кольори', categoryId: 'creative', difficulty: 'medium' },
          { _id: '4', text: 'Надішліть повідомлення старому другу', categoryId: 'social', difficulty: 'easy' },
          { _id: '5', text: 'Приготуйте новий рецепт', categoryId: 'home', difficulty: 'medium' },
          { _id: '6', text: 'Проведіть 5 хвилин у медитації', categoryId: 'mindful', difficulty: 'easy' }
        ];

        try {
          // Спробуємо отримати категорії з API
          const categoriesResponse = await axios.get(`${API_URL}/categories`);
          setCategories(categoriesResponse.data);

          // Отримуємо деталі виконаних челенджів з API
          if (completedIds.length > 0) {
            const challengesResponse = await axios.get(`${API_URL}/challenges`);
            const allChallenges = challengesResponse.data;
            
            const completed = allChallenges.filter(challenge => 
              completedIds.includes(challenge._id)
            );
            
            setChallengeDetails(completed);
            calculateStats(completed);
          }
        } catch (apiError) {
          console.log('API недоступний, використовуємо локальні дані');
          // Використовуємо локальні дані якщо API недоступний
          setCategories(defaultCategories);
          
          if (completedIds.length > 0) {
            const completed = defaultChallenges.filter(challenge => 
              completedIds.includes(challenge._id)
            );
            setChallengeDetails(completed);
            calculateStats(completed);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження даних профілю:', error);
      } finally {
        setLoading(false);
      }
    };

    const calculateStats = (completed) => {
      const totalCount = completed.length;
      const byCategory = {};
      const byDifficulty = {};
      
      completed.forEach(challenge => {
        // Статистика по категоріях
        if (byCategory[challenge.categoryId]) {
          byCategory[challenge.categoryId]++;
        } else {
          byCategory[challenge.categoryId] = 1;
        }
        
        // Статистика по складності
        if (byDifficulty[challenge.difficulty]) {
          byDifficulty[challenge.difficulty]++;
        } else {
          byDifficulty[challenge.difficulty] = 1;
        }
      });
      
      setStats({
        total: totalCount,
        byCategory,
        byDifficulty
      });
    };

    fetchUserData();
  }, [user, API_URL]);

  // Отримання назви категорії
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Невідома категорія';
  };

  // Отримання кольору категорії
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.color : 'bg-gray-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Завантаження профілю...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Кнопка повернення */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Повернутися до челенджів
        </button>

        {/* Заголовок профілю */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <User size={32} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Мій профіль</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Загальна статистика */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="bg-green-100 p-3 rounded-full inline-block mb-3">
              <Trophy size={24} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
            <p className="text-gray-600">Виконано челенджів</p>
          </div>

          {/* Статистика по складності */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">По складності</h3>
            <div className="space-y-2">
              {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                <div key={difficulty} className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyClass(difficulty)}`}>
                    {getDifficultyName(difficulty)}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(stats.byDifficulty).length === 0 && (
                <p className="text-gray-500 text-sm">Немає даних</p>
              )}
            </div>
          </div>

          {/* Статистика по категоріях */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">По категоріях</h3>
            <div className="space-y-2">
              {Object.entries(stats.byCategory).map(([categoryId, count]) => (
                <div key={categoryId} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    {getCategoryName(categoryId)}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(stats.byCategory).length === 0 && (
                <p className="text-gray-500 text-sm">Немає даних</p>
              )}
            </div>
          </div>
        </div>

        {/* Список виконаних челенджів */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <CheckCircle size={24} className="mr-2 text-green-600" />
            Виконані челенджі
          </h2>

          {challengeDetails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Ви ще не виконали жодного челенджа</p>
              <p className="text-sm">Почніть з головної сторінки!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challengeDetails.map((challenge) => (
                <div
                  key={challenge._id}
                  className={`p-4 rounded-lg border-l-4 ${getCategoryColor(challenge.categoryId)} bg-gray-50`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyClass(challenge.difficulty)}`}>
                        {getDifficultyName(challenge.difficulty)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                        {getCategoryName(challenge.categoryId)}
                      </span>
                    </div>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className="text-gray-800 font-medium">{challenge.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Мотиваційне повідомлення */}
        {stats.total > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white text-center">
            <h3 className="text-lg font-bold mb-2">Вітаємо! 🎉</h3>
            <p>
              Ви виконали {stats.total} {stats.total === 1 ? 'челендж' : stats.total < 5 ? 'челенджі' : 'челенджів'}! 
              Продовжуйте в тому ж дусі!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;