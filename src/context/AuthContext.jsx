import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext(null);

const LOCAL_USER_KEY = 'fitcheck_active_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase Auth is configured
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }

    // Local fallback persistence
    const saved = localStorage.getItem(LOCAL_USER_KEY);
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local user:', e);
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }

    // Simulated Google Sign-In for instant zero-config testing
    const demoUser = {
      uid: 'google_user_demo_101',
      email: 'alex.fashion@gmail.com',
      displayName: 'Alex Fashion',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      provider: 'google'
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    return demoUser;
  };

  const loginWithEmail = async (email, password) => {
    if (!email || !password) throw new Error('Email and password are required');

    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    }

    // Local fallback
    const localUser = {
      uid: 'email_user_' + btoa(email.toLowerCase()).substring(0, 10),
      email: email.trim(),
      displayName: email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider: 'password'
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setCurrentUser(localUser);
    return localUser;
  };

  const signupWithEmail = async (email, password, displayName) => {
    if (!email || !password) throw new Error('Email and password are required');

    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return cred.user;
    }

    // Local fallback
    const localUser = {
      uid: 'email_user_' + btoa(email.toLowerCase()).substring(0, 10),
      email: email.trim(),
      displayName: displayName || email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider: 'password'
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setCurrentUser(localUser);
    return localUser;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
