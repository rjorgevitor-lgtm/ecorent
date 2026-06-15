import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb
        .collection('users')
        .authWithPassword(email, password, { $autoCancel: false });

      setCurrentUser(authData.record);

      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name, phone) => {
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        name,
        phone: phone || ''
      };

      const record = await pb
        .collection('users')
        .create(data, { $autoCancel: false });

      const authData = await pb
        .collection('users')
        .authWithPassword(email, password, { $autoCancel: false });

      setCurrentUser(authData.record);

      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    window.location.href = "/";
  };

  const isAuthenticated = pb.authStore.isValid;

  const value = {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
    initialLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
