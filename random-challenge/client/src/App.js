// src/App.js
import React from 'react';
import { useAuth } from './components/AuthProvider';
import Login from './components/Login';
import RandomChallenge from './components/RandomChallengeApp';

function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <button onClick={logout} className="p-2 m-2 bg-red-500 text-white rounded">Вийти</button>
          <RandomChallenge />
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
