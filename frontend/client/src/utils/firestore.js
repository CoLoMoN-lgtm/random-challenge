// src/utils/firestore.js
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  enableNetwork,
  disableNetwork,
  getDocFromCache,
  getDocFromServer
} from 'firebase/firestore';
import { db, checkOnlineStatus } from '../firebase';

// Локальний кеш для офлайн режиму
const localCache = {
  completedChallenges: new Map(),
  userProfiles: new Map()
};

// Зберегти дані в локальному сховищі
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Не вдалося зберегти в localStorage:', error);
  }
};

// Отримати дані з локального сховища
const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Не вдалося прочитати з localStorage:', error);
    return defaultValue;
  }
};

// Отримати виконані челенджі користувача
export const getCompletedChallenges = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const cacheKey = `completedChallenges_${userId}`;
    
    // Спочатку перевіряємо локальний кеш
    if (localCache.completedChallenges.has(userId)) {
      return localCache.completedChallenges.get(userId);
    }

    const userDocRef = doc(db, 'users', userId);
    let userDocSnap;
    
    if (checkOnlineStatus()) {
      try {
        // Спробуємо отримати з сервера
        userDocSnap = await getDocFromServer(userDocRef);
      } catch (serverError) {
        console.log('Не вдалося отримати з сервера, використовуємо кеш');
        userDocSnap = await getDocFromCache(userDocRef);
      }
    } else {
      // Офлайн режим - використовуємо кеш
      userDocSnap = await getDocFromCache(userDocRef);
    }
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const completedChallenges = userData.completedChallenges || [];
      
      // Зберігаємо в локальному кеші
      localCache.completedChallenges.set(userId, completedChallenges);
      saveToLocalStorage(cacheKey, completedChallenges);
      
      return completedChallenges;
    } else {
      // Документ не існує - перевіряємо localStorage
      const cached = getFromLocalStorage(cacheKey, []);
      localCache.completedChallenges.set(userId, cached);
      
      // Якщо онлайн, створюємо документ
      if (checkOnlineStatus()) {
        try {
          await setDoc(userDocRef, {
            completedChallenges: cached,
            createdAt: new Date(),
            lastActivity: new Date()
          });
        } catch (createError) {
          console.log('Не вдалося створити документ користувача:', createError);
        }
      }
      
      return cached;
    }
  } catch (error) {
    console.error('Error getting completed challenges:', error);
    
    // Фолбек - використовуємо localStorage
    const cacheKey = `completedChallenges_${userId}`;
    const cached = getFromLocalStorage(cacheKey, []);
    localCache.completedChallenges.set(userId, cached);
    
    return cached;
  }
};

// Додати виконаний челендж до списку користувача
export const addCompletedChallenge = async (userId, challengeId) => {
  try {
    if (!userId || !challengeId) {
      throw new Error('User ID and Challenge ID are required');
    }

    // Оновлюємо локальний кеш одразу для швидкого відгуку UI
    const currentChallenges = localCache.completedChallenges.get(userId) || [];
    if (!currentChallenges.includes(challengeId)) {
      const updatedChallenges = [...currentChallenges, challengeId];
      localCache.completedChallenges.set(userId, updatedChallenges);
      
      // Зберігаємо в localStorage
      const cacheKey = `completedChallenges_${userId}`;
      saveToLocalStorage(cacheKey, updatedChallenges);
    }

    // Якщо онлайн, намагаємося синхронізувати з Firestore
    if (checkOnlineStatus()) {
      const userDocRef = doc(db, 'users', userId);
      
      try {
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          // Оновлюємо існуючий документ
          await updateDoc(userDocRef, {
            completedChallenges: arrayUnion(challengeId),
            lastActivity: new Date()
          });
        } else {
          // Створюємо новий документ користувача
          const currentChallenges = localCache.completedChallenges.get(userId) || [];
          await setDoc(userDocRef, {
            completedChallenges: currentChallenges,
            createdAt: new Date(),
            lastActivity: new Date()
          });
        }
        
        console.log('✅ Челендж збережено в Firestore');
      } catch (firestoreError) {
        console.log('📱 Челендж збережено локально, синхронізація відбудеться пізніше');
        // Додаємо до черги синхронізації
        addToSyncQueue('addChallenge', { userId, challengeId });
      }
    } else {
      console.log('📱 Офлайн режим: челендж збережено локально');
      // Додаємо до черги синхронізації
      addToSyncQueue('addChallenge', { userId, challengeId });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding completed challenge:', error);
    throw error;
  }
};

// Видалити виконаний челендж зі списку користувача
export const removeCompletedChallenge = async (userId, challengeId) => {
  try {
    if (!userId || !challengeId) {
      throw new Error('User ID and Challenge ID are required');
    }

    // Оновлюємо локальний кеш
    const currentChallenges = localCache.completedChallenges.get(userId) || [];
    const updatedChallenges = currentChallenges.filter(id => id !== challengeId);
    localCache.completedChallenges.set(userId, updatedChallenges);
    
    // Зберігаємо в localStorage
    const cacheKey = `completedChallenges_${userId}`;
    saveToLocalStorage(cacheKey, updatedChallenges);

    // Якщо онлайн, оновлюємо Firestore
    if (checkOnlineStatus()) {
      try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          completedChallenges: arrayRemove(challengeId),
          lastActivity: new Date()
        });
        console.log('✅ Челендж видалено з Firestore');
      } catch (firestoreError) {
        console.log('📱 Челендж видалено локально, синхронізація відбудеться пізніше');
        addToSyncQueue('removeChallenge', { userId, challengeId });
      }
    } else {
      console.log('📱 Офлайн режим: челендж видалено локально');
      addToSyncQueue('removeChallenge', { userId, challengeId });
    }
    
    return true;
  } catch (error) {
    console.error('Error removing completed challenge:', error);
    throw error;
  }
};

// Черга синхронізації для офлайн операцій
const syncQueue = getFromLocalStorage('firestore_sync_queue', []);

// Додати операцію до черги синхронізації
const addToSyncQueue = (operation, data) => {
  const queueItem = {
    id: Date.now() + Math.random(),
    operation,
    data,
    timestamp: new Date().toISOString()
  };
  
  syncQueue.push(queueItem);
  saveToLocalStorage('firestore_sync_queue', syncQueue);
};

// Синхронізувати чергу з Firestore
export const syncOfflineChanges = async () => {
  if (!checkOnlineStatus() || syncQueue.length === 0) {
    return;
  }

  console.log(`🔄 Синхронізація ${syncQueue.length} офлайн операцій...`);
  
  const processedItems = [];
  
  for (const item of syncQueue) {
    try {
      switch (item.operation) {
        case 'addChallenge':
          const { userId: addUserId, challengeId: addChallengeId } = item.data;
          const userDocRef = doc(db, 'users', addUserId);
          await updateDoc(userDocRef, {
            completedChallenges: arrayUnion(addChallengeId),
            lastActivity: new Date()
          });
          break;
          
        case 'removeChallenge':
          const { userId: removeUserId, challengeId: removeChallengeId } = item.data;
          const removeUserDocRef = doc(db, 'users', removeUserId);
          await updateDoc(removeUserDocRef, {
            completedChallenges: arrayRemove(removeChallengeId),
            lastActivity: new Date()
          });
          break;
      }
      
      processedItems.push(item.id);
      console.log(`✅ Синхронізовано: ${item.operation}`);
    } catch (error) {
      console.error(`❌ Помилка синхронізації ${item.operation}:`, error);
    }
  }
  
  // Видаляємо оброблені елементи з черги
  const updatedQueue = syncQueue.filter(item => !processedItems.includes(item.id));
  syncQueue.length = 0;
  syncQueue.push(...updatedQueue);
  saveToLocalStorage('firestore_sync_queue', syncQueue);
  
  console.log(`✅ Синхронізація завершена. Залишилось в черзі: ${syncQueue.length}`);
};

// Автоматична синхронізація при поверненні онлайн
window.addEventListener('online', () => {
  setTimeout(() => {
    syncOfflineChanges();
  }, 3000); // Затримка для стабілізації з'єднання
});

// Отримати профіль користувача
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Перевіряємо локальний кеш
    if (localCache.userProfiles.has(userId)) {
      return localCache.userProfiles.get(userId);
    }

    const userDocRef = doc(db, 'users', userId);
    let userDocSnap;
    
    try {
      if (checkOnlineStatus()) {
        userDocSnap = await getDocFromServer(userDocRef);
      } else {
        userDocSnap = await getDocFromCache(userDocRef);
      }
    } catch (error) {
      // Фолбек на localStorage
      const cacheKey = `userProfile_${userId}`;
      const cachedProfile = getFromLocalStorage(cacheKey);
      if (cachedProfile) {
        localCache.userProfiles.set(userId, cachedProfile);
        return cachedProfile;
      }
      throw error;
    }
    
    if (userDocSnap.exists()) {
      const profile = userDocSnap.data();
      localCache.userProfiles.set(userId, profile);
      saveToLocalStorage(`userProfile_${userId}`, profile);
      return profile;
    } else {
      // Створюємо базовий профіль
      const newProfile = {
        completedChallenges: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        preferences: {
          favoriteCategories: [],
          preferredDifficulty: 'medium'
        }
      };
      
      // Зберігаємо локально
      localCache.userProfiles.set(userId, newProfile);
      saveToLocalStorage(`userProfile_${userId}`, newProfile);
      
      // Якщо онлайн, створюємо в Firestore
      if (checkOnlineStatus()) {
        try {
          await setDoc(userDocRef, newProfile);
        } catch (createError) {
          console.log('Не вдалося створити профіль в Firestore:', createError);
        }
      }
      
      return newProfile;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    // Повертаємо базовий профіль у випадку помилки
    const fallbackProfile = {
      completedChallenges: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      preferences: {
        favoriteCategories: [],
        preferredDifficulty: 'medium'
      }
    };
    
    localCache.userProfiles.set(userId, fallbackProfile);
    return fallbackProfile;
  }
};

// Оновити профіль користувача
export const updateUserProfile = async (userId, profileData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Оновлюємо локальний кеш
    const currentProfile = localCache.userProfiles.get(userId) || {};
    const updatedProfile = {
      ...currentProfile,
      ...profileData,
      lastActivity: new Date()
    };
    
    localCache.userProfiles.set(userId, updatedProfile);
    saveToLocalStorage(`userProfile_${userId}`, updatedProfile);

    // Якщо онлайн, оновлюємо Firestore
    if (checkOnlineStatus()) {
      try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          ...profileData,
          lastActivity: new Date()
        });
        console.log('✅ Профіль оновлено в Firestore');
      } catch (firestoreError) {
        console.log('📱 Профіль оновлено локально, синхронізація відбудеться пізніше');
        addToSyncQueue('updateProfile', { userId, profileData });
      }
    } else {
      console.log('📱 Офлайн режим: профіль оновлено локально');
      addToSyncQueue('updateProfile', { userId, profileData });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Перевірити статус підключення до Firestore
export const checkFirestoreConnection = async () => {
  try {
    if (!checkOnlineStatus()) {
      return false;
    }
    
    // Спробуємо прочитати документ
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
    return true;
  } catch (error) {
    console.log('Firestore connection error:', error);
    return false;
  }
};

// Увімкнути мережу Firestore
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log('Firestore network enabled');
    // Запускаємо синхронізацію після увімкнення мережі
    setTimeout(() => syncOfflineChanges(), 2000);
    return true;
  } catch (error) {
    console.error('Error enabling Firestore network:', error);
    return false;
  }
};

// Вимкнути мережу Firestore
export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log('Firestore network disabled');
    return true;
  } catch (error) {
    console.error('Error disabling Firestore network:', error);
    return false;
  }
};

// Очистити локальний кеш (для тестування)
export const clearLocalCache = () => {
  localCache.completedChallenges.clear();
  localCache.userProfiles.clear();
  localStorage.removeItem('firestore_sync_queue');
  console.log('🧹 Локальний кеш очищено');
};