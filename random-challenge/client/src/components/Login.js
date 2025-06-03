// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Реєстрація успішна!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Вхід успішний!");
        onLogin?.();
      }
    } catch (err) {
      alert("Помилка: " + err.message);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">{isRegistering ? 'Реєстрація' : 'Вхід'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          {isRegistering ? 'Зареєструватись' : 'Увійти'}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} className="mt-4 text-sm text-blue-600">
        {isRegistering ? 'Вже маєте акаунт? Увійти' : 'Ще немає акаунта? Зареєструватись'}
      </button>
    </div>
  );
}

export default Login;
