// src/App.js
import React, { useState } from 'react';
import { useAuth } from './components/AuthProvider';
import Login from './components/Login';
import RandomChallengeApp from './components/RandomChallengeApp';
import UserProfile from './components/UserProfile';
import { User, LogOut } from 'lucide-react';

function App() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('challenges'); // 'challenges' or 'profile'

  const handleLogout = () => {
    logout();
    setCurrentPage('challenges');
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen">
      {/* Навігаційна панель */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">Випадковий виклик</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Кнопки навігації */}
              <button
                onClick={() => setCurrentPage('challenges')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'challenges'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Челенджі
              </button>
              
              <button
                onClick={() => setCurrentPage('profile')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  currentPage === 'profile'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User size={16} className="mr-1" />
                Профіль
              </button>
              
              {/* Кнопка виходу */}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} className="mr-1" />
                Вийти
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Основний контент */}
      <main>
        {currentPage === 'challenges' ? (
          <RandomChallengeApp />
        ) : (
          <UserProfile onBack={() => setCurrentPage('challenges')} />
        )}
      </main>
    </div>
  );
}

export default App;