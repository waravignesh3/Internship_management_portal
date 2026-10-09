import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('internhub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('internhub_token') || null);
  const [loading, setLoading] = useState(true);

  // Theme & Accent State
  const [theme, setThemeState] = useState(() => localStorage.getItem('internhub_theme') || 'dark');
  const [accent, setAccentState] = useState(() => localStorage.getItem('internhub_accent') || 'blue');

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Theme Attributes on DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('internhub_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('internhub_accent', accent);
  }, [accent]);

  // Load Current User Profile on Mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('internhub_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: authToken, user: userData } = res.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('internhub_token', authToken);
        localStorage.setItem('internhub_user', JSON.stringify(userData));
        addToast(`Welcome back, ${userData.email}!`, 'success');
        return { success: true, role: userData.role };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed.';
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const { token: authToken, user: userData } = res.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('internhub_token', authToken);
        localStorage.setItem('internhub_user', JSON.stringify(userData));
        addToast('Registration successful! Welcome to InternHub.', 'success');
        return { success: true, role: userData.role };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed.';
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('internhub_token');
    localStorage.removeItem('internhub_user');
    addToast('Logged out successfully.', 'info');
  };

  const setTheme = (newTheme) => setThemeState(newTheme);
  const setAccent = (newAccent) => setAccentState(newAccent);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        role: user?.role || null,
        login,
        register,
        logout,
        theme,
        setTheme,
        accent,
        setAccent,
        toasts,
        addToast,
        removeToast,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
