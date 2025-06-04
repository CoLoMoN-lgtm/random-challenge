// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableNetwork, 
  disableNetwork,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCum7p9a2xXLt4FNURbK1_V5A6HU-foxYE",
    authDomain: "random-chelenge.firebaseapp.com",
    projectId: "random-chelenge",
    storageBucket: "random-chelenge.firebasestorage.app",
    messagingSenderId: "959116929403",
    appId: "1:959116929403:web:db39ab7e1693082fe535de",
    measurementId: "G-DW2GH7FD3Z"
};

// Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);

// Ініціалізуємо Auth
export const auth = getAuth(app);

// Ініціалізуємо Firestore з налаштуваннями для офлайн роботи
export const db = initializeFirestore(app, {
  localCache: {
    // Використовуємо персистентний кеш для офлайн роботи
    kind: 'persistent',
    // Встановлюємо необмежений розмір кешу
    sizeBytes: CACHE_SIZE_UNLIMITED
  },
  // Додаткові налаштування для стабільності
  experimentalForceLongPolling: false, // Використовуємо WebSocket замість long polling
});

// Функція для перевірки з'єднання з інтернетом
const checkOnlineStatus = () => {
  return navigator.onLine;
};

// Функція для безпечного увімкнення мережі
const safeEnableNetwork = async () => {
  try {
    if (checkOnlineStatus()) {
      await enableNetwork(db);
      console.log('✅ Firestore мережа увімкнена');
      return true;
    } else {
      console.log('🔒 Немає підключення до інтернету');
      return false;
    }
  } catch (error) {
    console.error('❌ Помилка увімкнення Firestore мережі:', error);
    return false;
  }
};

// Функція для безпечного вимкнення мережі
const safeDisableNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log('🔒 Firestore мережа вимкнена');
    return true;
  } catch (error) {
    console.error('❌ Помилка вимкнення Firestore мережі:', error);
    return false;
  }
};

// Обробка стану мережі з затримкою для уникнення частих перемикань
let networkTimeout;

window.addEventListener('online', () => {
    console.log('🌐 Підключення до інтернету відновлено');
    
    // Очищуємо попередній таймер
    if (networkTimeout) {
        clearTimeout(networkTimeout);
    }
    
    // Затримка для стабілізації з'єднання
    networkTimeout = setTimeout(() => {
        safeEnableNetwork();
    }, 1000);
});

window.addEventListener('offline', () => {
    console.log('📱 Підключення до інтернету втрачено - перехід в офлайн режим');
    
    // Очищуємо попередній таймер
    if (networkTimeout) {
        clearTimeout(networkTimeout);
    }
    
    // Негайно вимикаємо мережу
    safeDisableNetwork();
});

// Експортуємо утилітні функції
export { safeEnableNetwork, safeDisableNetwork, checkOnlineStatus };

// Перевіряємо початковий стан мережі
if (checkOnlineStatus()) {
    console.log('🌐 Додаток запущено з підключенням до інтернету');
    setTimeout(() => safeEnableNetwork(), 2000); // Затримка для ініціалізації
} else {
    console.log('📱 Додаток запущено в офлайн режимі');
}