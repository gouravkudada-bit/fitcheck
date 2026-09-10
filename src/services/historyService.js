import { db, isFirebaseConfigured } from './firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY_PREFIX = 'fitcheck_history_';

export async function saveOutfitCheck(userId, checkData) {
  if (!userId) {
    throw new Error('User ID is required to save outfit check.');
  }

  const payload = {
    userId,
    photoURL: checkData.photoURL || checkData.imageUrl,
    occasion: checkData.occasion,
    score: checkData.score,
    vibe: checkData.vibe,
    harmony: checkData.harmony,
    suggestions: checkData.suggestions,
    createdAt: new Date().toISOString(),
  };

  // If Firebase Firestore is active
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'outfit_checks'), {
        ...payload,
        timestamp: serverTimestamp(),
      });
      return { id: docRef.id, ...payload };
    } catch (err) {
      console.warn('Firestore write failed, falling back to local store:', err);
    }
  }

  // Local fallback storage
  const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
  const existing = getLocalHistory(userId);
  const newEntry = {
    id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    ...payload,
  };

  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (storageErr) {
    // If image data is too large for single localStorage item, strip or compress
    if (storageErr.name === 'QuotaExceededError') {
      const lightweightEntry = {
        ...newEntry,
        photoURL: newEntry.photoURL?.startsWith('data:') ? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' : newEntry.photoURL
      };
      const trimmed = [lightweightEntry, ...existing.slice(0, 10)];
      localStorage.setItem(key, JSON.stringify(trimmed));
    }
  }

  return newEntry;
}

export async function getUserHistory(userId) {
  if (!userId) return [];

  // If Firebase Firestore is active
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'outfit_checks'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().timestamp?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Firestore read failed, falling back to local store:', err);
    }
  }

  // Local fallback
  return getLocalHistory(userId);
}

export async function deleteOutfitCheck(userId, checkId) {
  if (!userId || !checkId) return;

  if (isFirebaseConfigured && db && !checkId.startsWith('local_')) {
    try {
      await deleteDoc(doc(db, 'outfit_checks', checkId));
      return;
    } catch (err) {
      console.warn('Firestore delete failed, trying local store:', err);
    }
  }

  const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
  const existing = getLocalHistory(userId);
  const filtered = existing.filter((item) => item.id !== checkId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

function getLocalHistory(userId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading local history:', err);
    return [];
  }
}
