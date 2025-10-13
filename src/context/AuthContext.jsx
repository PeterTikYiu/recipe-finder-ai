/* eslint react-refresh/only-export-components: 0 */
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import authService from '../services/authService';
import storageService from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = authService.subscribeAuth((u) => {
      setUser(u ? { uid: u.uid, name: u.displayName, email: u.email, photoURL: u.photoURL } : null);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signIn: authService.signInWithGoogle,
    signOut: authService.signOutUser,
    getPrefs: () => {
      if (user?.uid) {
        const key = `user_preferences:${user.uid}`;
        return storageService.getItem(key) || {};
      }
      return storageService.getUserPreferences() || {};
    },
    setPrefs: (p) => {
      if (user?.uid) {
        const key = `user_preferences:${user.uid}`;
        return storageService.setItem(key, { ...(storageService.getItem(key) || {}), ...p });
      }
      return storageService.setUserPreferences(p);
    },
    updatePref: (k, v) => {
      if (user?.uid) {
        const key = `user_preferences:${user.uid}`;
        const prefs = storageService.getItem(key) || {};
        prefs[k] = v;
        return storageService.setItem(key, prefs);
      }
      return storageService.updatePreference(k, v);
    },
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
