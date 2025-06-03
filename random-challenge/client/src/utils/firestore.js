// src/utils/firestore.js
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export const addCompletedChallenge = async (userId, challengeId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, {
      completedChallenges: arrayUnion(challengeId),
    });
  } else {
    await setDoc(userRef, {
      completedChallenges: [challengeId],
    });
  }
};

export const getCompletedChallenges = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data().completedChallenges || [];
  } else {
    return [];
  }
};
